import "./globals.css";

import Providers from "./providers";

import type { Metadata } from "next";

import type {
  ReactNode,
} from "react";

export const metadata: Metadata = {
  title: "SSC Tracking",
  description:
    "Package tracking platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <html lang="en">

      <body>

        <Providers>
          {children}
        </Providers>

      </body>

    </html>
  );
}