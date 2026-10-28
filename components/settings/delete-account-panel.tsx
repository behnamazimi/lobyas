"use client";

import { useState, useTransition } from "react";
import { deleteOwnAccountAction } from "@/app/(private)/app/settings/actions";
import { ConfirmDialog, Pill, TextInput } from "@/components/kit";
import { DangerZone } from "@/components/settings/ui";
import { clearReminders, syncRemindersFromServer } from "@/lib/reminders/device";

function DeleteAccountDialog({ email, onClose }: { email: string; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canConfirm = typed.trim().toLowerCase() === email.toLowerCase() && !isPending;

  function confirm() {
    if (!canConfirm) return;
    startTransition(async () => {
      // A deleted account redirects away, so this has to happen first.
      await clearReminders().catch(() => {});
      const result = await deleteOwnAccountAction(typed.trim());
      if (result.error) {
        setError(result.error);
        void syncRemindersFromServer();
      }
    });
  }

  return (
    <ConfirmDialog
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Delete your account?"
      confirmLabel={isPending ? "Deleting…" : "Delete account"}
      confirmDisabled={!canConfirm}
      busy={isPending}
      onConfirm={confirm}
    >
      <p className="m-0">
        Your terms, collections, study history and settings are deleted for good. This can&apos;t be
        undone.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          confirm();
        }}
        className="mt-3 flex flex-col gap-1.5"
      >
        <label htmlFor="delete-account-email" className="text-sm font-bold">
          Type <strong>{email}</strong> to confirm
        </label>
        <TextInput
          id="delete-account-email"
          type="email"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
        {error ? (
          <p role="alert" className="m-0 text-sm font-bold text-wrong-text">
            {error}
          </p>
        ) : null}
      </form>
    </ConfirmDialog>
  );
}

export function DeleteAccountPanel({ email }: { email: string }) {
  const [isAsking, setIsAsking] = useState(false);

  return (
    <DangerZone
      title="Delete account"
      description="Permanently remove your account and everything in it."
    >
      <Pill variant="danger" onClick={() => setIsAsking(true)}>
        Delete…
      </Pill>
      {isAsking ? <DeleteAccountDialog email={email} onClose={() => setIsAsking(false)} /> : null}
    </DangerZone>
  );
}
