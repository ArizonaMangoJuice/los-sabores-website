"use client";

import AdUnit from "./AdUnit";

interface InFeedAdProps {
  className?: string;
}

export default function InFeedAd({ className = "" }: InFeedAdProps) {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!adClient) return null;

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-warm-gray/5 p-4 flex items-center justify-center min-h-[250px] ${className}`}
    >
      <AdUnit
        slot={process.env.NEXT_PUBLIC_AD_SLOT_INFEED || ""}
        format="fluid"
        layout="in-article"
        layoutKey="-6t+ed+2i-1n-4w"
      />
    </div>
  );
}
