import Image from "next/image";
import { Youtube } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { SOCIAL_LINKS, SITE_NAME } from "@/lib/constants";

const CHANNEL_LOGO =
  "https://yt3.ggpht.com/ytc/AIdro_mmlKfFRPNU40tFbHFsp4DhLiI2UZNQCb19f2lf2BYQZQY=s800-c-k-c0x00ffffff-no-rj";

export default function SubscribeCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative bg-gradient-to-br from-chile-red via-terracotta to-terracotta-dark rounded-3xl p-10 md:p-14 text-center overflow-hidden">
            {/* Decorative elements - more visible */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-white/5 rounded-full" />

            <div className="relative z-10">
              {/* Channel logo with animated pulse ring */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full ring-4 ring-white/20 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/30 shadow-xl">
                  <Image
                    src={CHANNEL_LOGO}
                    alt={SITE_NAME}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">
                {SITE_NAME}
              </h2>
              <p className="text-white/80 max-w-md mx-auto mb-8 leading-relaxed">
                Suscribete para nuevas recetas cada semana / Subscribe for new
                recipes every week
              </p>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-chile-red font-bold rounded-full hover:bg-cream hover:-translate-y-0.5 transition-all shadow-xl shadow-black/15"
              >
                <Youtube className="w-5 h-5" />
                YouTube
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
