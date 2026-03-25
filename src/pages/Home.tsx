import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Eye, History as HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen pt-32 md:ml-16">
      {/* Hero Section */}
      <section className="px-8 md:px-24 mb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl"
        >
          <div className="mb-12 opacity-80">
            <div className="h-24 w-24 border-2 border-primary rounded-full flex items-center justify-center">
              <div className="h-16 w-16 border border-primary/50 rounded-full flex items-center justify-center">
                <div className="h-8 w-8 bg-primary/20 rounded-full" />
              </div>
            </div>
          </div>
          <h1 className="font-headline text-5xl md:text-8xl text-on-surface leading-tight tracking-tight mb-8">
            Knowledge is a <span className="italic text-primary">Sanctuary</span> built from the ruins of silence.
          </h1>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-outline mb-16">Est. MMXIV — The Eternal Archive</p>
        </motion.div>
      </section>

      {/* Origin Story */}
      <section className="bg-surface-container-low py-32">
        <div className="px-8 md:px-24 grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-5 mb-12 md:mb-0">
            <h2 className="font-headline text-3xl text-primary-container mb-6">The Genesis of Shadow</h2>
            <p className="font-label text-sm text-outline-variant leading-relaxed uppercase tracking-widest">A record of the founding</p>
          </div>
          <div className="col-span-12 md:col-span-7 pl-0 md:pl-16">
            <div className="space-y-12">
              <p className="font-body text-2xl md:text-3xl text-on-surface-variant leading-relaxed italic">
                "In the absolute stillness of the Dark Night of the Soul, when every external light had vanished, we found that truth does not emit a glow—it demands a witness."
              </p>
              <div className="font-body text-lg text-on-surface space-y-8 max-w-2xl">
                <p>
                  Athanaeum Arcanum was not conceived in a moment of triumph, but in the profound vacuum of loss. It began as a ledger of things we feared the world would forget: the weight of a hand-pressed page, the silence of a vaulted room, and the terrifying clarity that comes when the ego finally surrenders to the infinite.
                </p>
                <p>
                  We spent a decade curating fragments of the esoteric and the discarded. We sought the architecture of thought that precedes modern noise. This library exists to provide a horizon for those lost in the flat plains of the digital age.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Bento */}
      <section className="px-8 md:px-24 py-32 bg-surface">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <PhilosophyCard 
            icon={<BookOpen className="text-primary" size={40} />}
            title="Organic Archivalism"
            description="We reject the disposable. Every entry in the Arcanum is curated with the weight of centuries, ensuring the digital vellum never fades."
          />
          <PhilosophyCard 
            icon={<Eye className="text-primary" size={40} />}
            title="The Silent Curator"
            description="Information is noise; knowledge is music. We provide the silence necessary for the music to be heard once more."
            className="bg-surface-container-low border-y md:border-y-0 md:border-x border-outline-variant/10"
          />
          <PhilosophyCard 
            icon={<HistoryIcon className="text-primary" size={40} />}
            title="A Living Legacy"
            description="This is a sanctuary for the seeker. A repository for the truths that survive the fire of scrutiny and the passage of time."
          />
        </div>
      </section>

      {/* Manifesto Quote */}
      <section className="py-40 flex justify-center items-center text-center px-8">
        <div className="max-w-4xl">
          <blockquote className="font-headline text-4xl md:text-6xl text-on-surface leading-snug mb-12">
            "Truth is not found in the <span className="text-primary italic">shouting</span> of many, but in the <span className="text-primary-container italic">whispering</span> of one."
          </blockquote>
          <div className="h-px w-24 bg-primary mx-auto mb-12"></div>
          <Link 
            to="/archive"
            className="inline-block bg-primary text-on-primary px-12 py-5 font-label font-bold uppercase tracking-widest hover:bg-primary-container transition-all scale-100 active:scale-95 duration-200"
          >
            Enter the Archive
          </Link>
        </div>
      </section>
    </div>
  );
}

function PhilosophyCard({ icon, title, description, className = "bg-surface-container" }: { icon: React.ReactNode, title: string, description: string, className?: string }) {
  return (
    <div className={`${className} p-12 aspect-square flex flex-col justify-between group hover:bg-surface-container-high transition-colors`}>
      {icon}
      <div>
        <h3 className="font-headline text-2xl mb-4 text-on-surface">{title}</h3>
        <p className="font-body text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
}
