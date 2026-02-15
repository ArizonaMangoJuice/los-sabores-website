import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getChannelInfo } from "@/lib/youtube";
import { Youtube, Users, Video } from "lucide-react";
import { formatViewCount } from "@/lib/utils";
import { SOCIAL_LINKS, SITE_NAME } from "@/lib/constants";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Image from "next/image";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return {
    title: `${t("title")} | ${SITE_NAME}`,
    description: t("description"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "About" });

  let channelInfo = null;
  try {
    channelInfo = await getChannelInfo();
  } catch (error) {
    console.error("Failed to fetch channel info:", error);
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-chocolate">
              {t("title")}
            </h1>
            <div className="w-16 h-1 bg-terracotta mt-4 mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        {/* Channel info card */}
        <ScrollReveal delay={0.1}>
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {channelInfo?.thumbnailUrl && (
                <div className="flex-shrink-0">
                  <Image
                    src={channelInfo.thumbnailUrl}
                    alt={SITE_NAME}
                    width={120}
                    height={120}
                    className="rounded-full shadow-md"
                  />
                </div>
              )}
              <div className="text-center md:text-left">
                <h2 className="font-heading font-bold text-2xl text-chocolate mb-2">
                  {channelInfo?.title || SITE_NAME}
                </h2>
                <p className="text-warm-gray leading-relaxed">
                  {t("description")}
                </p>
              </div>
            </div>

            {/* Stats */}
            {channelInfo && (
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-warm-gray/10">
                <div className="text-center p-4 bg-linen rounded-2xl">
                  <Users className="w-6 h-6 text-terracotta mx-auto mb-2" />
                  <p className="font-heading font-bold text-2xl text-chocolate">
                    {formatViewCount(channelInfo.subscriberCount)}
                  </p>
                  <p className="text-sm text-warm-gray">{t("subscribers")}</p>
                </div>
                <div className="text-center p-4 bg-linen rounded-2xl">
                  <Video className="w-6 h-6 text-terracotta mx-auto mb-2" />
                  <p className="font-heading font-bold text-2xl text-chocolate">
                    {channelInfo.videoCount}
                  </p>
                  <p className="text-sm text-warm-gray">{t("videos")}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Story section */}
        <ScrollReveal delay={0.2}>
          <div className="bg-gradient-to-br from-terracotta to-chile-red rounded-3xl p-8 md:p-12 text-center">
            <h3 className="font-heading font-bold text-2xl text-white mb-6">
              {t("followUs")}
            </h3>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-chile-red font-bold rounded-full hover:bg-cream transition-colors shadow-lg"
            >
              <Youtube className="w-6 h-6" />
              YouTube
            </a>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
