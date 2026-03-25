import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const BOOKS_FILE = path.join(process.cwd(), "books.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Security constants
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 5;
const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

// Validate required environment variables
if (!process.env.ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD environment variable must be set");
}
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function getBooks() {
  try {
    const data = fs.readFileSync(BOOKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveBooks(books: any[]) {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
}

// Allowed image MIME types
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Multer config for file uploads with validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP)"));
    }
    cb(null, true);
  },
});

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  max: LOGIN_MAX_ATTEMPTS,
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static(path.join(process.cwd(), "public")));
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Auth Middleware
  const authenticateAdmin = (req: any, res: any, next: any) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Auth Routes
  app.post("/api/admin/login", loginLimiter, (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "1d" });
      res.cookie("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE_MS,
      });
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Incorrect password" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie("admin_token");
    res.json({ success: true });
  });

  app.get("/api/admin/check", (req, res) => {
    const token = req.cookies.admin_token;
    if (!token) return res.json({ authenticated: false });
    try {
      jwt.verify(token, JWT_SECRET);
      res.json({ authenticated: true });
    } catch (e) {
      res.json({ authenticated: false });
    }
  });

  // AI Chat Endpoint (server-side to protect API key)
  app.post("/api/chat", async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    try {
      const { message, history } = req.body;
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: "You are the Archival Assistant for the Athenaeum Arcanum, a digital library of ancient and mysterious manuscripts. Your tone is scholarly, helpful, and slightly mysterious. You help researchers find information about the library's collection, which includes works like 'The Emerald Tablet', 'The Voynich Manuscript', and scientific works by Copernicus and Newton. If asked about specific books, refer to them as 'archival records' or 'codices'. Keep responses concise but evocative.",
        },
      });

      const response = await chat.sendMessage({ message });
      const aiText = response.text || "The archives are silent on this matter. Perhaps rephrase your inquiry?";
      res.json({ response: aiText });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to process your inquiry" });
    }
  });

  // AI Recommendations Endpoint (server-side to protect API key)
  app.post("/api/recommendations", async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    try {
      const { currentBook, history } = req.body;
      const allBooks = getBooks();
      const historyBooks = allBooks.filter((b: any) => history.includes(b.id));
      const historyContext = historyBooks.map((b: any) => `${b.title} (${b.category})`).join(", ");

      const prompt = `
        You are the High Curator of the Athanaeum Arcanum.
        A seeker is currently studying the manuscript: "${currentBook.title}" by ${currentBook.author} in the discipline of ${currentBook.category}.
        Their recent study history includes: ${historyContext || "No previous records"}.

        Based on this, recommend exactly 3 other manuscripts from the following archive that are related by category (${currentBook.category}) or by the same author (${currentBook.author}).
        Prioritize manuscripts that would deepen their understanding or provide a resonant perspective.

        Archive:
        ${allBooks.map((b: any) => `- ID: ${b.id}, Title: ${b.title}, Author: ${b.author}, Category: ${b.category}, Description: ${b.description}`).join("\n")}

        Return only the IDs of the 3 recommended manuscripts as a JSON array.
      `;

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              recommendedIds: {
                type: "array",
                items: { type: "string" },
                description: "The IDs of the recommended manuscripts",
              },
            },
            required: ["recommendedIds"],
          },
        },
      });

      const result = JSON.parse(response.text || '{"recommendedIds": []}');
      const recommendedIds = result.recommendedIds as string[];
      const recommendedBooks = allBooks.filter((b: any) => recommendedIds.includes(b.id) && b.id !== currentBook.id).slice(0, 3);
      
      res.json(recommendedBooks);
    } catch (error) {
      console.error("Recommendations API error:", error);
      
      // Fallback: prioritize same category and author
      const allBooks = getBooks();
      const sameAuthor = allBooks.filter((b: any) => b.author === currentBook.author && b.id !== currentBook.id);
      const sameCategory = allBooks.filter((b: any) => b.category === currentBook.category && b.id !== currentBook.id && !sameAuthor.includes(b));
      const others = allBooks.filter((b: any) => b.id !== currentBook.id && !sameAuthor.includes(b) && !sameCategory.includes(b));
      res.json([...sameAuthor, ...sameCategory, ...others].slice(0, 3));
    }
  });

  // API routes
  app.get("/api/books", (req, res) => {
    res.json(getBooks());
  });

  app.get("/api/books/:id", (req, res) => {
    const books = getBooks();
    const book = books.find((b: any) => b.id === req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  });

  // Admin CRUD routes
  const validateBook = (book: any) => {
    if (!book.title || book.title.trim().length < 2) return "Title must be at least 2 characters.";
    if (!book.author || book.author.trim().length < 2) return "Author name must be at least 2 characters.";
    if (!book.description || book.description.trim().length < 10) return "Short description must be at least 10 characters.";
    if (!book.longDescription || book.longDescription.trim().length < 20) return "Long archival description must be at least 20 characters.";
    if (!book.imageUrl) return "A manuscript cover image is required.";
    if (!book.date) return "Archival date is required.";
    if (!book.accessibility) return "Accessibility level is required.";
    return null;
  };

  app.post("/api/admin/books", authenticateAdmin, (req, res) => {
    const error = validateBook(req.body);
    if (error) return res.status(400).json({ message: error });

    const books = getBooks();
    const newBook = { ...req.body, id: Date.now().toString() };
    books.push(newBook);
    saveBooks(books);
    res.json(newBook);
  });

  app.put("/api/admin/books/:id", authenticateAdmin, (req, res) => {
    const error = validateBook(req.body);
    if (error) return res.status(400).json({ message: error });

    const books = getBooks();
    const index = books.findIndex((b: any) => b.id === req.params.id);
    if (index !== -1) {
      books[index] = { ...books[index], ...req.body };
      saveBooks(books);
      res.json(books[index]);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  });

  app.delete("/api/admin/books/:id", authenticateAdmin, (req, res) => {
    let books = getBooks();
    books = books.filter((b: any) => b.id !== req.params.id);
    saveBooks(books);
    res.json({ success: true });
  });

  // File upload route with error handling
  app.post("/api/admin/upload", authenticateAdmin, upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Error handler for multer
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: `File too large. Max size is ${FILE_SIZE_LIMIT / (1024 * 1024)}MB` });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

const appPromise = startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
