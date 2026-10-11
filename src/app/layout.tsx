import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "JanAwaaz - Samasya Se Samadhaan Tak",
  description:
    "JanAwaaz is a smart civic complaint platform. Report potholes, garbage, broken streetlights and more, and track every complaint until it is resolved.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
