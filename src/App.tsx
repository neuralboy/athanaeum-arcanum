import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Archive from './pages/Archive';
import BookDetail from './pages/BookDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminNotes from './pages/AdminNotes';
import Notes from './pages/Notes';
import NotFound from './pages/NotFound';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // Close sidebar on route change
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-on-primary">
      {!isAdminPage && (
        <>
          <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
      )}
      
      <main>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/archive" element={<PageWrapper><Archive /></PageWrapper>} />
            <Route path="/book/:id" element={<PageWrapper><BookDetail /></PageWrapper>} />
            <Route path="/notes" element={<PageWrapper><Notes /></PageWrapper>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/notes" element={<AdminNotes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isAdminPage && (
        <>
          <Footer />
          <ChatBot />
        </>
      )}
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
