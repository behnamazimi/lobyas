import type { ComponentProps, ReactNode } from "react";
import { HomeBackButton } from "@/components/shared/back-link";
import { SMALL_TITLE_CLASS } from "./title-class";

type AuthCardProps = {
  title: ReactNode;
  /** Only the steps that lead on from Log in show the back chevron. */
  backHref?: string;
  /** Renders the card as a form. */
  action?: ComponentProps<"form">["action"];
  children: ReactNode;
};

/** The small centered card for login, sign-up and the password and access steps. */
export function AuthCard({ title, backHref, action, children }: AuthCardProps) {
  const className =
    "flex w-full max-w-sm flex-col gap-4 rounded-box border border-base-300 bg-base-100 p-6 shadow-card sm:p-8";
  const content = (
    <>
      {backHref ? <HomeBackButton href={backHref} label="Back to log in" /> : null}
      <h1 className={SMALL_TITLE_CLASS}>{title}</h1>
      {children}
    </>
  );

  return action ? (
    <form action={action} className={className}>
      {content}
    </form>
  ) : (
    <div className={className}>{content}</div>
  );
}
