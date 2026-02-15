import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });

  const title = `${t("title")} | ${SITE_NAME}`;
  const description = t("intro").slice(0, 160);
  const esPath = "/es/privacidad";
  const enPath = "/en/privacy";
  const currentPath = locale === "es" ? esPath : enPath;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${SITE_URL}${currentPath}`,
      languages: {
        es: `${SITE_URL}${esPath}`,
        en: `${SITE_URL}${enPath}`,
      },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Privacy" });

  const sections = [
    { title: t("section1Title"), text: t("section1Text"), items: t("section1Items").split("|") },
    { title: t("section2Title"), text: t("section2Text") },
    { title: t("section3Title"), text: t("section3Text") },
    { title: t("section4Title"), text: t("section4Text") },
    { title: t("section5Title"), text: t("section5Text") },
    { title: t("section6Title"), text: t("section6Text") },
    { title: t("section7Title"), text: t("section7Text") },
    { title: t("section8Title"), text: t("section8Text") },
  ];

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-terracotta/10 rounded-2xl mb-4">
              <Shield className="w-7 h-7 text-terracotta" />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-chocolate">
              {t("title")}
            </h1>
            <p className="text-sm text-warm-gray mt-3">{t("lastUpdated")}</p>
            <div className="w-16 h-1 bg-terracotta mt-4 mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 space-y-8">
            <p className="text-chocolate/80 leading-relaxed">{t("intro")}</p>

            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="font-heading font-bold text-xl text-chocolate mb-3">
                  {i + 1}. {section.title}
                </h2>
                <p className="text-chocolate/70 leading-relaxed">{section.text}</p>
                {section.items && (
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-chocolate/70 text-sm"
                      >
                        <span className="text-terracotta mt-1">&#x2022;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
