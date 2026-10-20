"use client";

import { trackException } from "@/lib/analytics/track";
import { Figtree, Fraunces } from "next/font/google";
import { useEffect } from "react";
import { SomethingWentWrongScene } from "@/components/illustrations/scenes/something-went-wrong";
import { Pill, StatusScreen } from "@/components/kit";
import { DARK_THEME, LIGHT_THEME, THEME_COOKIE_NAME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

const themeScript = `(function(){var m=document.cookie.match(/${THEME_COOKIE_NAME}=([^;]+)/);document.documentElement.setAttribute("data-theme",m&&m[1]==="${DARK_THEME}"?"${DARK_THEME}":"${LIGHT_THEME}")})()`;

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
};

export default function GlobalError({ error, reset, unstable_retry }: GlobalErrorProps) {
  const retry = unstable_retry ?? reset;

  useEffect(() => {
    trackException(error);
    console.error(error);
  }, [error]);

  return (
    <html
      lang="en"
      data-theme={LIGHT_THEME}
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", figtree.variable, fraunces.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="flex min-h-full flex-col justify-center bg-base-200 px-5 text-base-content"
        suppressHydrationWarning
      >
        <StatusScreen
          illustration={<SomethingWentWrongScene />}
          title="Something went wrong"
          description="This page didn’t load. Your terms and progress are fine. Try again in a moment."
          actions={
            <>
              {retry ? <Pill onClick={retry}>Try again</Pill> : null}
              <Pill href="/" variant="secondary">
                Go home
              </Pill>
            </>
          }
        />
      </body>
    </html>
  );
}
