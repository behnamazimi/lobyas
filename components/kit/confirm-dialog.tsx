"use client";

import type { ReactNode } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { Pill } from "./controls/pill";

/** A centered confirmation: title, body, Cancel and a danger action. While `busy`
 *  it can't be dismissed and the action is disabled. */
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  children,
  confirmLabel,
  onConfirm,
  busy = false,
  confirmDisabled = false,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void;
  busy?: boolean;
  /** Keeps the danger action off until the person has done what the body asks. */
  confirmDisabled?: boolean;
}) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!busy}
      isKeyboardDismissDisabled={busy}
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-content/45 p-6 transition-opacity duration-150 data-entering:opacity-0 data-exiting:opacity-0"
    >
      <Modal className="w-full max-w-[400px] rounded-[28px] bg-base-100 p-[22px] shadow-sheet">
        <Dialog role="alertdialog" className="outline-none">
          {({ close }) => (
            <>
              <Heading
                slot="title"
                className="m-0 font-heading text-2xl font-extrabold [overflow-wrap:anywhere]"
              >
                {title}
              </Heading>
              <div className="mt-2 text-[15px] leading-snug font-semibold text-ink-soft [overflow-wrap:anywhere]">
                {children}
              </div>
              <div className="mt-[18px] grid grid-cols-2 gap-2.5">
                <Pill
                  variant="secondary"
                  size="lg"
                  disabled={busy}
                  onClick={close}
                  className="h-[52px] text-base"
                >
                  Cancel
                </Pill>
                <Pill
                  variant="danger"
                  size="lg"
                  disabled={busy || confirmDisabled}
                  onClick={onConfirm}
                  className="h-[52px] bg-wrong text-white text-base"
                >
                  {confirmLabel}
                </Pill>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
