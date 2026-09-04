import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Davis 晚霞｜今晚值得追吗？',
  description: '每天一份 Davis 晚霞指数、日落时间、云层判断与观赏建议。',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Davis 晚霞｜今晚值得追吗？',
    description: '每天一份 Davis 晚霞指数、日落时间、云层判断与观赏建议。',
    type: 'website',
    locale: 'zh_CN',
    images: [{
      url: 'https://raw.githubusercontent.com/cubhe/davis_sunset/main/public/davis-sunset-atmosphere.png',
      alt: 'Davis 平原与卷云晚霞插画',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Davis 晚霞｜今晚值得追吗？',
    description: '每天一份 Davis 晚霞指数、日落时间、云层判断与观赏建议。',
    images: ['https://raw.githubusercontent.com/cubhe/davis_sunset/main/public/davis-sunset-atmosphere.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* GoatCounter analytics (privacy-friendly, no cookies). Same site as cubhe.github.io. */}
        <script data-goatcounter="https://cubhe.goatcounter.com/count" async src="//gc.zgo.at/count.js" />
      </body>
    </html>
  );
}
