import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "../components/SessionWrapper";
import LayoutWrapper from "../components/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Minds - Mental Wellness Platform",
  description: "Your comprehensive mental health companion with AI support, professional care, and wellness tools.",
  keywords: "mental health, AI counselor, wellness, therapy, support",
  authors: [{ name: "Minds Team" }],

};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#10b981" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        
        <SessionWrapper>
           <LayoutWrapper>
        {children}
        </LayoutWrapper>
        </SessionWrapper>
      </body>
    </html>
  );
}
