import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Usman Khair Din — White-label UI & Frontend Partner",
  description: "White-label UI design and frontend production for digital agencies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
