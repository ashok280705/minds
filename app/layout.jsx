import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "../components/SessionWrapper";
import LayoutWrapper from "../components/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Clarity Care 3.0 - AI Healthcare Platform",
  description: "Professional AI-powered healthcare platform for mental wellness, medical analysis, and comprehensive health management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        
        <SessionWrapper>
           <LayoutWrapper>
        {children}
        </LayoutWrapper>
        </SessionWrapper>
      </body>
    </html>
  );
}
