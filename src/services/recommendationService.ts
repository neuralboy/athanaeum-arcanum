import { Book } from "../types";

export async function getRecommendations(currentBook: Book, history: string[]): Promise<Book[]> {
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentBook, history }),
    });

    if (!response.ok) {
      throw new Error('Recommendations API failed');
    }

    const recommendedBooks = await response.json();
    return recommendedBooks.filter((b: Book) => b.id !== currentBook.id).slice(0, 3);
  } catch (error) {
    // Fallback: prioritize same category and author
    try {
      const responseBooks = await fetch('/api/books');
      const allBooks: Book[] = await responseBooks.json();

      const sameAuthor = allBooks.filter(b => b.author === currentBook.author && b.id !== currentBook.id);
      const sameCategory = allBooks.filter(b => b.category === currentBook.category && b.id !== currentBook.id && !sameAuthor.includes(b));
      const others = allBooks.filter(b => b.id !== currentBook.id && !sameAuthor.includes(b) && !sameCategory.includes(b));

      return [...sameAuthor, ...sameCategory, ...others].slice(0, 3);
    } catch {
      return [];
    }
  }
}
