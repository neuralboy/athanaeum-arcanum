export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest py-12 border-t border-outline-variant/10 flex flex-col items-center gap-4 w-full mt-20">
      <p className="font-body italic text-sm text-on-surface-variant">© MMXIV Athanaeum Arcanum. All truths preserved.</p>
      <div className="flex gap-8">
        {['Legal', 'Contact', 'Legacy'].map((link) => (
          <a
            key={link}
            href="#"
            className="text-outline hover:text-on-surface-variant font-label text-xs uppercase tracking-widest transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}
