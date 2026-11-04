import { Inter, Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Switzer: the font of the new HR-portal Figma designs (same files as the
// Ascendus website).
const switzer = localFont({
  variable: "--font-switzer-family",
  src: [
    { path: "../fonts/switzer/Switzer-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/switzer/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/switzer/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/switzer/Switzer-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata = {
  title: "HRMS Portal",
  description: "Human resource management portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${switzer.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
