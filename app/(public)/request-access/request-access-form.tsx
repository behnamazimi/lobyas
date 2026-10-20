"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "@/components/public/auth-card";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SENDER_EMAIL } from "@/lib/site";
import { requestAccess } from "./actions";

const AFTER_ADDRESS = ` as soon as there's room. It comes from ${SENDER_EMAIL}, so check your spam folder if it doesn't show up.`;

type RequestAccessFormProps = {
  defaultEmail?: string;
  emailLocked?: boolean;
};

export default function RequestAccessForm({
  defaultEmail = "",
  emailLocked = false,
}: RequestAccessFormProps) {
  const [state, action, pending] = useActionState(requestAccess, null);

  if (state && "success" in state) {
    return (
      <AuthCard title="You're on the list" backHref="/login">
        <p className="text-sm text-base-content/70">
          Your invite will be emailed to <strong>{state.email}</strong>
          {AFTER_ADDRESS}
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Request access" backHref="/login">
      <p className="text-sm text-base-content/70">
        Lobyas is invite-only right now. Leave your email and we&apos;ll send you an invite when
        there&apos;s room.
      </p>

      <form action={action} className="flex flex-col gap-4">
        {state?.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="request-access-email">Email</FieldLabel>
            <Input
              id="request-access-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              defaultValue={defaultEmail}
              readOnly={emailLocked}
              className={emailLocked ? "opacity-70" : undefined}
            />
            {emailLocked ? (
              <FieldDescription>Tied to the account you&apos;re logged in with.</FieldDescription>
            ) : null}
          </Field>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="request-access-company">Company</label>
            <input
              id="request-access-company"
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        </FieldGroup>

        <Button type="submit" isDisabled={pending} className="mt-2 w-full">
          {pending ? "Requesting…" : "Request access"}
        </Button>
      </form>

      <p className="m-0 text-center text-sm text-base-content/70">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-2">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
