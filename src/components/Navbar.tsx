import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({ isSidebarOpen, setIsSidebarOpen }: { isSidebarOpen: boolean, setIsSidebarOpen: (open: boolean) => void }) {
  const location = useLocation();

  const navLinks = [
    { name: 'Archive', path: '/archive' },
    { name: 'About', path: '/' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-nav border-b border-outline-variant/15">
      <div className="max-w-none px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="text-2xl font-bold tracking-tighter text-primary font-headline">
              Athanaeum Arcanum
            </span>
          </Link>
          <div className="hidden md:flex gap-10 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-headline uppercase tracking-widest text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-primary hover:bg-surface-container p-2 transition-all duration-300">
            <Search size={20} />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-primary hover:bg-surface-container p-2 transition-all duration-300 md:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
