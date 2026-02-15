import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Playfair_Display, Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/ads/GoogleAnalytics";
import type { Metadata } from "next";
import "../globals.css";

const SITE_URL = "https://saboresmitierra.com";
const CHANNEL_LOGO =
  "https://yt3.ggpht.com/ytc/AIdro_mmlKfFRPNU40tFbHFsp4DhLiI2UZNQCb19f2lf2BYQZQY=s800-c-k-c0x00ffffff-no-rj";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Los Sabores de Mi Tierra - Recetas Tradicionales Mexicanas",
    template: "%s | Los Sabores de Mi Tierra",
  },
  description:
    "Descubre recetas autenticas de la cocina mexicana y latinoamericana. Videos paso a paso, ingredientes y preparacion de platillos tradicionales.",
  keywords: [
    "recetas mexicanas",
    "cocina tradicional",
    "recetas latinoamericanas",
    "comida mexicana",
    "Mexican recipes",
    "traditional cooking",
    "Latin American food",
    "recetas faciles",
    "cocina casera",
    "Los Sabores de Mi Tierra",
  ],
  authors: [{ name: "Los Sabores de Mi Tierra" }],
  creator: "Los Sabores de Mi Tierra",
  openGraph: {
    type: "website",
    locale: "es_MX",
    alternateLocale: "en_US",
    siteName: "Los Sabores de Mi Tierra",
    title: "Los Sabores de Mi Tierra - Recetas Tradicionales",
    description:
      "Recetas autenticas de la cocina mexicana con videos paso a paso.",
    images: [{ url: CHANNEL_LOGO, width: 800, height: 800, alt: "Los Sabores de Mi Tierra" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Los Sabores de Mi Tierra",
    description:
      "Recetas autenticas de la cocina mexicana con videos paso a paso.",
    images: [CHANNEL_LOGO],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      es: `${SITE_URL}/es`,
      en: `${SITE_URL}/en`,
    },
  },
  verification: {
    google: "t9B6rpmto30cXBg2-ysVL8smU02Y9RCrPq9O_b9Fdrk",
  },
};

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="font-body bg-cream text-chocolate antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Los Sabores de Mi Tierra",
              url: "https://saboresmitierra.com",
              description:
                "Recetas autenticas de la cocina mexicana y latinoamericana con videos paso a paso.",
              inLanguage: ["es", "en"],
              publisher: {
                "@type": "Organization",
                name: "Los Sabores de Mi Tierra",
                url: "https://www.youtube.com/@lossaboresdemitierra8378",
                logo: {
                  "@type": "ImageObject",
                  url: "https://yt3.ggpht.com/ytc/AIdro_mmlKfFRPNU40tFbHFsp4DhLiI2UZNQCb19f2lf2BYQZQY=s800-c-k-c0x00ffffff-no-rj",
                },
                sameAs: [
                  "https://www.youtube.com/@lossaboresdemitierra8378",
                ],
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://saboresmitierra.com/es/recetas?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
