import type { Metadata } from "next";
import "./globals.css";
import "./motion.css";
import "./ribbon.css";
import { ExperienceCanvas } from "@/components/ExperienceCanvas";

export const metadata: Metadata = {
  title: "Usman Khair Din — White-label UI & Frontend Partner",
  description: "White-label UI design and frontend production for digital agencies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="page-root"><ExperienceCanvas /><div className="page-content">{children}</div></div></body></html>;
}
