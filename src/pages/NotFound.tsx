import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-surface-container-highest rounded-full flex items-center justify-center">
          <BookOpen size={48} className="text-outline" />
        </div>
        <h1 className="font-headline text-6xl text-primary mb-4">404</h1>
        <h2 className="font-headline text-2xl uppercase tracking-widest mb-4">Manuscript Not Found</h2>
        <p className="font-body italic text-on-surface-variant mb-8">
          The archival record you seek has been lost to the sands of time, or perhaps never existed at all.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Return to Archives
        </Link>
      </div>
    </div>
  );
}
