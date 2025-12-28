import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'


const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  //title template depending on the page
  metadataBase: new URL("https://bluemigrate.com"),
  title: {
    default: "BlueMigrate",
    template: "%s - BlueMigrate",
  },
  description: "Migrate your tweets and follows to Bluesky in a few clicks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`antialiased h-full bg-muted ${inter.className}`}>
        {children}

      </body>
      <GoogleAnalytics gaId="G-J0LV4VRNYK" />
    </html>
  );
}
