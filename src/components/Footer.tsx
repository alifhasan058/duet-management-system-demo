import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-200/80 pt-6 pb-8">
      <div className="flex flex-col items-start justify-between gap-2 text-xs text-slate-500 sm:flex-row sm:items-center">
        <p className="leading-relaxed">
          Concept management system demo prepared by Alif Hasan - Logo, Branding &amp; Packaging Designer -{' '}
          <a
            href="https://alifhasan.framer.website"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0D9488] underline decoration-[#0D9488]/30 underline-offset-2 transition-colors hover:text-[#0F766E] hover:decoration-[#0F766E]"
          >
            alifhasan.framer.website
          </a>
        </p>
        <p className="whitespace-nowrap font-medium text-slate-400">
          Concept demo only · Not the official Duet system
        </p>
      </div>
    </footer>
  );
};
