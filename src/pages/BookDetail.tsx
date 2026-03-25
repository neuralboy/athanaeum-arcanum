import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Download, Bookmark, History, MapPin, Star, Sparkles, Loader2, ChevronRight, BookmarkCheck } from 'lucide-react';
import { Book } from '../types';
import { getRecommendations } from '../services/recommendationService';
import LazyImage from '../components/LazyImage';
import StatusBadge from '../components/StatusBadge';
import { useReadLater } from '../hooks/useReadLater';

export default function BookDetail() {
  const { id } = useParams();
  const { toggleSave, isSaved } = useReadLater();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${id}`);
        if (response.ok) {
          const data = await response.json();
          setBook(data);
        } else {
          setBook(null);
        }
      } catch {
        setBook(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (!book) return;

    // Track history
    const history = JSON.parse(localStorage.getItem('athanaeum_history') || '[]');
    if (!history.includes(book.id)) {
      const newHistory = [book.id, ...history].slice(0, 10);
      localStorage.setItem('athanaeum_history', JSON.stringify(newHistory));
    }

    // Fetch recommendations
    const fetchRecs = async () => {
      setLoadingRecs(true);
      const recs = await getRecommendations(book, history);
      setRecommendations(recs);
      setLoadingRecs(false);
    };

    fetchRecs();
  }, [id, book]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center md:ml-16">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!book) return <div className="pt-32 px-8">Manuscript not found in the archive.</div>;

  return (
    <div className="min-h-screen pt-24 md:ml-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 mb-16 font-label text-[10px] uppercase tracking-[0.4em] text-outline">
          <Link to="/archive" className="hover:text-primary transition-colors">Archive</Link>
          <ChevronRight size={10} />
          <span className="text-primary">{book.category}</span>
          <ChevronRight size={10} />
          <span className="opacity-50">Codex {book.id}</span>
        </nav>

        {/* Hero Header */}
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <StatusBadge status={book.status} />
            </div>
            <h1 className="font-headline text-6xl md:text-9xl text-on-surface mb-8 leading-[0.9] tracking-tighter">
              {book.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 1 ? 'italic text-primary' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex flex-col gap-6">
                <p className="font-body italic text-2xl md:text-4xl text-on-surface-variant max-w-2xl">
                  An archival study of the works attributed to <span className="text-on-surface not-italic font-medium">{book.author}</span>.
                </p>
                <button
                  onClick={() => toggleSave(book.id)}
                  className={`flex items-center gap-2 w-fit px-6 py-3 rounded-full border transition-all duration-300 font-label text-xs uppercase tracking-widest ${
                    isSaved(book.id)
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-transparent text-on-surface border-outline-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  {isSaved(book.id) ? (
                    <>
                      <BookmarkCheck size={16} />
                      Saved to Reading List
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} />
                      Add to Read Later
                    </>
                  )}
                </button>
              </div>
              <div className="text-right border-l md:border-l-0 md:border-r border-primary/20 pl-6 md:pl-0 md:pr-6 py-2">
                <span className="block font-label text-[10px] uppercase tracking-widest text-outline mb-1">Archival Status</span>
                <span className="font-label text-xs uppercase tracking-widest text-primary">Verified Authenticity</span>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="mb-32 relative group"
        >
          <div className="aspect-[21/9] overflow-hidden bg-surface-container-low shadow-2xl shadow-black/40">
            <LazyImage 
              src={book.imageUrl} 
              alt={book.title}
              aspectRatio="aspect-auto"
              className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-1000"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        </motion.div>

        {/* Main Content Grid: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          {/* Left Column: Book Details */}
          <div className="lg:col-span-8">
            <section className="mb-20">
              <h2 className="font-label text-xs uppercase tracking-[0.5em] text-primary mb-12 flex items-center gap-4">
                <span className="w-12 h-px bg-primary/30"></span>
                Manuscript Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/10 border border-outline-variant/10 mb-16">
                <div className="bg-background p-8">
                  <MetadataItem label="Discipline" value={book.category} isPrimary />
                </div>
                <div className="bg-background p-8">
                  <MetadataItem label="Archival Date" value={book.date} />
                </div>
                <div className="bg-background p-8">
                  <MetadataItem label="Preservation" value={<StatusBadge status={book.status || 'Parchment, High Wear'} className="text-xs px-3 py-1" />} />
                </div>
                <div className="bg-background p-8">
                  <MetadataItem label="Clearance" value={book.accessibility || 'Level III Required'} />
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="font-body text-2xl leading-relaxed text-on-surface-variant first-letter:text-8xl first-letter:font-headline first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:leading-none">
                  {book.longDescription || book.description}
                </p>
                {book.longDescription && (
                  <div className="mt-12 p-8 bg-surface-container-lowest border-l-4 border-primary/40 italic font-body text-xl text-on-surface-variant/80">
                    "The ink used in this codex contains trace amounts of stardust. It is said that reading it under a full moon reveals hidden constellations within the margins."
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 mt-20">
                <button className="flex-1 bg-primary text-on-primary px-10 py-5 font-label font-bold uppercase tracking-widest text-xs hover:bg-primary-container transition-all duration-500 flex items-center justify-center gap-4 group">
                  <BookOpen size={18} className="group-hover:scale-110 transition-transform" />
                  Begin Archival Study
                </button>
                <button className="flex-1 border border-outline-variant/40 text-on-surface px-10 py-5 font-label font-bold uppercase tracking-widest text-xs hover:bg-surface-container transition-all duration-500 flex items-center justify-center gap-4 group">
                  <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                  Export Metadata
                </button>
                <button className="p-5 text-primary hover:bg-surface-container transition-colors border border-outline-variant/20">
                  <Bookmark size={20} />
                </button>
              </div>

              {/* Image Gallery */}
              <ImageGallery images={book.images} title={book.title} />
            </section>
          </div>

          {/* Right Column: Curated Insights */}
          <aside className="lg:col-span-4 sticky top-32">
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-surface-container-lowest p-10 border border-outline-variant/10 shadow-2xl shadow-black/40"
            >
              <h3 className="font-headline text-2xl mb-12 text-on-surface flex items-center gap-4">
                <Sparkles className="text-primary" size={24} />
                Curated Insights
              </h3>
              <div className="flex flex-col gap-10">
                <InsightCard 
                  icon={<History className="text-primary" size={20} />}
                  title="The Author's Fate"
                  description="Master Elara vanished shortly after the final chapter was transcribed. Rumors suggest she didn't leave her study, but rather her dimension."
                  isPrimary
                />
                <InsightCard 
                  icon={<MapPin className="text-primary" size={20} />}
                  title="Recovery Site"
                  description="Section B, Shelf 14, Submerged Wing. Retrieved by Curator Aris during the spring tide of MMXIX."
                />
                <InsightCard 
                  icon={<Star className="text-primary" size={20} />}
                  title="Collector's Note"
                  description="One of only three surviving copies with the silver-leaf star charts intact."
                />
              </div>
            </motion.section>
          </aside>
        </div>

        {/* Related Books Section: Below the two-column layout */}
        <section className="mt-48 border-t border-outline-variant/15 pt-24">
          <div className="flex items-center justify-between mb-16">
            <div>
              <span className="font-label text-xs uppercase tracking-[0.4em] text-primary mb-4 block flex items-center gap-3">
                <Sparkles size={16} />
                Resonance Study
              </span>
              <h3 className="font-headline text-4xl md:text-5xl text-on-surface tracking-tight">Manuscripts of Similar Frequency</h3>
            </div>
            {loadingRecs && <Loader2 className="animate-spin text-primary" size={24} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <AnimatePresence mode="popLayout">
              {loadingRecs ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-surface-container-low aspect-[3/4] mb-6"></div>
                    <div className="h-8 bg-surface-container w-3/4 mb-3"></div>
                    <div className="h-4 bg-surface-container w-1/2"></div>
                  </div>
                ))
              ) : (
                recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <Link to={`/book/${rec.id}`} onClick={() => window.scrollTo(0, 0)}>
                      <div className="mb-8 relative">
                        <LazyImage 
                          src={rec.imageUrl} 
                          alt={rec.title}
                          className="grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                        />
                        <div className="absolute top-4 right-4 z-10">
                          <StatusBadge status={rec.status} />
                        </div>
                      </div>
                      <h4 className="font-headline text-2xl text-on-surface mb-2 group-hover:text-primary transition-colors leading-tight">{rec.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-px bg-outline-variant/30"></span>
                        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline">{rec.category}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetadataItem({ label, value, isPrimary }: { label: string, value: React.ReactNode, isPrimary?: boolean }) {
  return (
    <div>
      <span className="block font-label text-[10px] uppercase tracking-[0.3em] text-outline mb-1">{label}</span>
      <div className={`font-body text-lg ${isPrimary ? 'text-primary' : 'text-on-surface'}`}>{value}</div>
    </div>
  );
}

function InsightCard({ icon, title, description, isPrimary, className = "bg-surface-container" }: { icon: React.ReactNode, title: string, description: string, isPrimary?: boolean, className?: string }) {
  return (
    <div className={`${className} p-8 ${isPrimary ? 'border-l-2 border-primary' : ''}`}>
      <div className="mb-4">{icon}</div>
      <h4 className="font-headline text-lg mb-2">{title}</h4>
      <p className="font-body text-on-surface-variant italic">{description}</p>
    </div>
  );
}

function ImageGallery({ images, title }: { images?: string[], title: string }) {
  const placeholders = [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'
  ];

  const displayImages = images && images.length > 0 ? images : placeholders;

  return (
    <div className="mt-24 border-t border-outline-variant/15 pt-16">
      <div className="flex items-center gap-4 mb-12">
        <Sparkles className="text-primary" size={24} />
        <h3 className="font-headline text-3xl text-on-surface">Visual Records</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {displayImages.map((img, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group relative overflow-hidden bg-surface-container-low"
          >
            <LazyImage 
              src={img} 
              alt={`${title} - View ${idx + 1}`}
              aspectRatio="aspect-square"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
