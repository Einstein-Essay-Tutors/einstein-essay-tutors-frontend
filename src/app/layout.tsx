import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Einstein Essay Tutors - Professional Academic Writing Services",
  description: "Get expert academic writing help from professional tutors. Essays, research papers, dissertations, and more. Quality work delivered on time.",
  keywords: "academic writing, essay writing, research papers, tutoring, academic help",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
          <WhatsAppFloat />
        </AuthProvider>
      </body>
    </html>
  );
}
