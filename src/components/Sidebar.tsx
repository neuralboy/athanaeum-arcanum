import React, { useState, useEffect } from 'react';
import { BookOpen, History, FlaskConical, Eye, Bookmark } from 'lucide-react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useReadLater } from '../hooks/useReadLater';
import { Book } from '../types';

const disciplines = [
  { name: 'Hidden Truths', icon: BookOpen },
  { name: 'History', icon: History },
  { name: 'Science', icon: FlaskConical },
  { name: 'Esoterica', icon: Eye },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeDiscipline = searchParams.get('discipline');
  const { savedIds } = useReadLater();
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (savedIds.length > 0) {
      fetch('/api/books')
        .then(res => res.json())
        .then((allBooks: Book[]) => {
          setSavedBooks(allBooks.filter(b => savedIds.includes(b.id)));
        })
        .catch(() => {
          // Silently handle error
        });
    } else {
      setSavedBooks([]);
    }
  }, [savedIds]);

  const handleDisciplineClick = (name: string) => {
    if (location.pathname !== '/archive') {
      navigate(`/archive?discipline=${encodeURIComponent(name)}`);
    } else {
      setSearchParams({ discipline: name });
    }
    onClose(); // Close the sidebar when a discipline is selected
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 h-full bg-surface-container-low border-r border-outline-variant/15 pt-24 flex flex-col z-40 shadow-2xl shadow-black/50 transition-all duration-500 group overflow-hidden ${
        isOpen 
          ? 'w-64 translate-x-0' 
          : '-translate-x-full md:translate-x-0 md:w-16 md:hover:w-64'
      }`}>
        {/* Mobile Navigation Links */}
        <div className="md:hidden px-5 mb-10 flex flex-col gap-4">
          <Link to="/archive" onClick={onClose} className="font-headline uppercase tracking-widest text-lg text-on-surface hover:text-primary transition-colors">Archive</Link>
          <Link to="/" onClick={onClose} className="font-headline uppercase tracking-widest text-lg text-on-surface hover:text-primary transition-colors">About</Link>
          <div className="h-px w-full bg-outline-variant/20 my-2" />
        </div>

        <div className="px-5 mb-12 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
          <h2 className="text-primary font-headline text-lg uppercase tracking-tight">The Disciplines</h2>
          <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] mt-1">Filter the Archive</p>
        </div>
        <nav className="flex flex-col gap-6">
          {disciplines.map((discipline) => (
            <button
              key={discipline.name}
              onClick={() => handleDisciplineClick(discipline.name)}
              className={`flex items-center gap-4 py-3 pl-5 transition-all duration-300 group/item text-left relative ${
                activeDiscipline === discipline.name 
                  ? 'text-primary bg-primary/10' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'
              }`}
            >
              {activeDiscipline === discipline.name && (
                <motion.div 
                  layoutId="active-bar"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary" 
                />
              )}
              <div className="min-w-[24px] flex justify-center">
                <discipline.icon size={20} className={`${activeDiscipline === discipline.name ? 'scale-110' : 'group-hover/item:scale-110'} transition-transform`} />
              </div>
              <span className="font-label font-medium text-xs tracking-wider uppercase opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
                {discipline.name}
              </span>
            </button>
          ))}
          
          <AnimatePresence>
            {activeDiscipline && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-5 mt-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              >
                <button
                  onClick={() => {
                    if (location.pathname !== '/archive') {
                      navigate('/archive');
                    } else {
                      setSearchParams({});
                    }
                    onClose();
                  }}
                  className="w-full py-2 text-[10px] font-label uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-all border border-primary/30 rounded whitespace-nowrap overflow-hidden"
                >
                  Clear Filter
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Reading List Section */}
        <div className="mt-auto border-t border-outline-variant/15 pt-8 pb-12">
          <div className="px-5 mb-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
            <h2 className="text-primary font-headline text-lg uppercase tracking-tight flex items-center gap-2">
              <Bookmark size={18} />
              Reading List
            </h2>
            <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] mt-1">Saved for later</p>
          </div>
          
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant/20">
            {savedBooks.length > 0 ? (
              savedBooks.map((book) => (
                <Link
                  key={book.id}
                  to={`/book/${book.id}`}
                  onClick={onClose}
                  className="flex flex-col px-5 py-3 hover:bg-primary/5 transition-colors group/item"
                >
                  <span className="font-headline text-sm text-on-surface group-hover/item:text-primary transition-colors truncate opacity-100 md:opacity-0 group-hover:opacity-100 duration-500">
                    {book.title}
                  </span>
                  <span className="font-label text-[9px] uppercase tracking-widest text-outline truncate opacity-100 md:opacity-0 group-hover:opacity-100 duration-500">
                    {book.author}
                  </span>
                </Link>
              ))
            ) : (
              <div className="px-5 py-4 text-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-on-surface-variant font-body italic text-xs">No manuscripts saved.</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
