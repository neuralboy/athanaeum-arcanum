import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronDown, Quote, X, Loader2 } from 'lucide-react';
import { Book } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import LazyImage from '../components/LazyImage';
import StatusBadge from '../components/StatusBadge';
import { useReadLater } from '../hooks/useReadLater';
import { Bookmark, BookmarkCheck } from 'lucide-react';

const disciplines = ['Hidden Truths', 'History', 'Science', 'Esoterica'];

export default function Archive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleSave, isSaved } = useReadLater();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const activeDiscipline = searchParams.get('discipline');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        const data = await response.json();
        setBooks(data);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = activeDiscipline 
    ? books.filter(book => book.category === activeDiscipline)
    : books;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center md:ml-16">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:ml-16">
      <div className="px-6 md:px-12 py-10">
        {/* Header Section */}
        <header className="mb-16">
          <span className="font-label text-xs uppercase tracking-[0.3em] text-outline mb-4 block">Central Repository</span>
          <h1 className="font-headline text-5xl md:text-7xl text-on-surface leading-tight max-w-4xl">
            The Eternal <span className="italic text-primary">Manuscripts</span>.
          </h1>
        </header>

        {/* Filter Bar */}
        <section className="glass-nav sticky top-20 z-30 py-6 mb-12 -mx-4 px-4 border-y border-outline-variant/10">
          <div className="flex flex-wrap items-center gap-8 justify-between">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <div className="flex flex-col gap-2">
                <span className="font-label text-[10px] text-outline uppercase tracking-widest">Discipline</span>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSearchParams({})}
                    className={`font-label text-xs uppercase tracking-widest pb-1 transition-colors ${!activeDiscipline ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    All Threads
                  </button>
                  {disciplines.map(d => (
                    <button 
                      key={d} 
                      onClick={() => setSearchParams({ discipline: d })}
                      className={`transition-colors font-label text-xs uppercase tracking-widest pb-1 ${activeDiscipline === d ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-8 w-px bg-outline-variant/30 hidden md:block"></div>
              <div className="flex flex-col gap-2">
                <span className="font-label text-[10px] text-outline uppercase tracking-widest">Author</span>
                <div className="flex items-center gap-2 cursor-pointer text-on-surface hover:text-primary transition-colors">
                  <span className="font-label text-xs uppercase">Curator's Choice</span>
                  <ChevronDown size={14} className="text-primary" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-on-surface-variant font-label text-xs uppercase tracking-tighter">Displaying {filteredBooks.length} Records</span>
              {activeDiscipline && (
                <button 
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-1 text-[10px] font-label uppercase tracking-widest text-primary hover:text-primary-container transition-colors"
                >
                  <X size={10} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20">
          {filteredBooks.map((book, idx) => (
            <motion.article 
              key={book.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className={`group cursor-pointer ${idx % 2 === 1 ? 'pt-12 md:pt-24' : ''}`}
            >
              <Link to={`/book/${book.id}`}>
                <div className="mb-6">
                  <LazyImage 
                    src={book.imageUrl} 
                    alt={book.title}
                    className="grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-60 pointer-events-none"></div>
                  <div className="absolute top-4 right-4 z-10">
                    <StatusBadge status={book.status} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSave(book.id);
                    }}
                    className={`absolute top-4 left-4 z-10 p-2 rounded-full transition-all duration-300 ${
                      isSaved(book.id) 
                        ? 'bg-primary text-on-primary' 
                        : 'bg-surface-container-highest/50 text-on-surface hover:bg-primary/20 hover:text-primary'
                    }`}
                  >
                    {isSaved(book.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </button>
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className={`px-2 py-0.5 font-label text-[9px] uppercase tracking-widest ${
                      book.category === 'Hidden Truths' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'
                    }`}>
                      {book.category}
                    </span>
                  </div>
                </div>
                <h3 className="font-headline text-xl text-on-surface mb-2 group-hover:text-primary transition-colors">{book.title}</h3>
                <p className="font-body italic text-on-surface-variant text-sm border-l border-outline-variant pl-4 py-1">{book.author}</p>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Profound Quote Section */}
        <section className="mt-40 mb-20 max-w-5xl">
          <div className="pl-20 md:pl-40 border-l border-primary/20">
            <Quote className="text-primary mb-6" size={32} />
            <blockquote className="font-headline text-3xl md:text-5xl text-on-surface-variant leading-tight">
              "The truth is not a destination, but a <span className="text-on-surface italic">resonance</span> found between the lines of the forgotten."
            </blockquote>
            <cite className="block mt-8 font-label text-xs uppercase tracking-[0.4em] text-outline">— The High Curator, MMXIV</cite>
          </div>
        </section>
      </div>
    </div>
  );
}
