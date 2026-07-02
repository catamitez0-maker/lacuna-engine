import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lacuna Studio",
  description: "Creator workspace shell for Lacuna Engine.",
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
