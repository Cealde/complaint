import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My App",
  description: "A clean Next.js app with an external CSS stylesheet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
