import React from 'react';
import { Image } from '@/components/ui/image';
import TrackLogo from './TrackLogo';

const MISS_LOWE_LOGO = 'https://media.base44.com/images/public/6a9374897e9609e0d36beee4/d139d12f8_Screenshot2026-08-31at34609PM.png';
const HERO_ICON = 'https://media.base44.com/images/public/6a9374897e9609e0d36beee4/181a62443_Gemini_Generated_Image_w5bidsw5bidsw5bi.jpeg';

export default function TrackGate({ onChoose }) {
  const Card = ({ value, eyebrow, title, note }) => (
    <button
      onClick={() => onChoose(value)}
      className="glassine border border-border bg-card rounded-sm p-10 text-left hover:border-[#6F551A]"
    >
      <div className="flex items-center gap-5 mb-6">
        <div className="min-w-0">
          <p className="chrono-eyebrow text-[#6F551A] mb-3">{eyebrow}</p>
          <p className="font-display text-4xl leading-none">{title}</p>
        </div>
        <TrackLogo track={value} size={56} className="ml-auto shrink-0" />
      </div>
      <p className="mt-4 text-sm text-foreground/55 leading-relaxed">{note}</p>
      <p className="mt-6 chrono-eyebrow text-[#6F551A]">Enter →</p>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-[#F4EFE3] flex items-center justify-center px-6 overflow-y-auto py-16">
      <div className="absolute top-6 right-6 w-24 md:w-28 shrink-0 pointer-events-none">
        <Image src={MISS_LOWE_LOGO} alt="By Miss Lowe" fittingType="fit" className="w-full h-auto" />
      </div>
      <div className="max-w-3xl w-full text-center">
        <p className="font-display text-3xl md:text-4xl mb-5">Miss Lowe's History Support site</p>
        <div className="mb-5 flex justify-center">
          <img src={HERO_ICON} alt="Miss Lowe" className="w-28 h-28 md:w-32 md:h-32 object-contain mix-blend-multiply" />
        </div>
        <h1 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-tight mb-3">
          Which course are you studying?
        </h1>
        <p className="text-foreground/60 mb-12">
          Choose your track — you can switch any time from the menu.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          <Card
            value="igcse"
            eyebrow="IGCSE"
            title="History"
            note="Core content, depth study, exam papers & coursework."
          />
          <Card
            value="ib"
            eyebrow="IB Diploma"
            title="History"
            note="Papers 1–3, Internal Assessment, Extended Essay & perspectives."
          />
        </div>
      </div>
    </div>
  );
}