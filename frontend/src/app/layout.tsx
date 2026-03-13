import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Playbook - Video Analysis for Amateur Sports",
  description: "Video analysis platform for coaches and teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} font-sans antialiased min-h-screen bg-turf-950 text-slate-100`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
