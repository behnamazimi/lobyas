"use client";

import { useActionState, useState } from "react";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { DeleteAccountPanel } from "@/components/settings/delete-account-panel";
import { SettingsPanel, SettingsRow, SettingsStack } from "@/components/settings/ui";
import { FormField, Pill, TextInput } from "@/components/kit";
import {
  changePasswordAction,
  type AccountSettings,
  type ChangePasswordState,
} from "@/app/(private)/app/settings/actions";
import { cn } from "@/lib/utils";

type PasswordFormProps = {
  hasPassword: boolean;
  action: (formData: FormData) => void;
  pending: boolean;
  state: ChangePasswordState;
};

function PasswordForm({ hasPassword, action, pending, state }: PasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <form action={action} className="flex flex-col gap-4">
      {state && "error" in state ? (
        <p
          role="alert"
          className="m-0 rounded-2xl bg-wrong-tint px-3.5 py-3 text-sm font-bold text-wrong-text"
        >
          {state.error}
        </p>
      ) : null}

      {hasPassword ? (
        <FormField label="Current password" htmlFor="account-current-password">
          <TextInput
            id="account-current-password"
            type="password"
            name="currentPassword"
            required
            autoComplete="current-password"
          />
        </FormField>
      ) : null}

      <FormField label="New password" htmlFor="account-new-password">
        <TextInput
          id="account-new-password"
          type="password"
          name="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setPasswordTouched(true)}
        />
        <PasswordRequirements
          password={password}
          visible={passwordTouched || password.length > 0}
        />
      </FormField>

      <FormField label="Confirm new password" htmlFor="account-confirm-password">
        <TextInput
          id="account-confirm-password"
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        {confirmPassword.length > 0 ? (
          <p
            className={cn(
              "m-0 text-xs font-bold",
              passwordsMatch ? "text-success-text" : "text-muted",
            )}
          >
            {passwordsMatch ? "Passwords match" : "Passwords don't match"}
          </p>
        ) : null}
      </FormField>

      <Pill type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}
      </Pill>
    </form>
  );
}

export function AccountPanel({ email, hasPassword }: AccountSettings) {
  const [state, action, pending] = useActionState(changePasswordAction, null);
  const saved = state && "success" in state ? state : null;

  return (
    <SettingsPanel
      id="account"
      title="Account"
      description="Manage how you log in, or delete your account."
    >
      <SettingsStack>
        <SettingsRow title="Email">
          <p className="m-0 text-[13px] font-semibold break-all text-muted">
            {email ?? "No email on this account"}
          </p>
        </SettingsRow>
        <SettingsRow
          title="Password"
          description={
            hasPassword
              ? "Changing it signs you out on your other devices."
              : "You log in with Google or Apple. Set a password to also log in with your email."
          }
        >
          {saved ? (
            <p
              role="status"
              className="m-0 rounded-2xl bg-success-tint px-3.5 py-3 text-sm font-bold text-success-text"
            >
              {hasPassword ? "Password changed." : "Password set."} You&apos;re signed out on your
              other devices.
            </p>
          ) : null}
          <PasswordForm
            key={saved?.id ?? "form"}
            hasPassword={hasPassword || saved !== null}
            action={action}
            pending={pending}
            state={state}
          />
        </SettingsRow>
      </SettingsStack>
      {email ? <DeleteAccountPanel email={email} /> : null}
    </SettingsPanel>
  );
}
