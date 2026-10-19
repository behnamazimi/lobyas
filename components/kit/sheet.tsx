"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { cn } from "@/lib/utils";

/** A bottom sheet on a phone and a centered dialog (max 480 px) from `md` up.
 *  The body scrolls; the footer stays pinned. `full` makes the phone sheet fill the screen. */
export function BottomSheet({
  isOpen,
  onOpenChange,
  title,
  subline,
  footer,
  full = false,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subline?: ReactNode;
  footer?: ReactNode;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 flex items-end justify-center bg-base-content/45 transition-opacity duration-150 data-entering:opacity-0 data-exiting:opacity-0 md:items-center md:p-6"
    >
      <Modal
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-t-[28px] bg-base-100 shadow-sheet transition duration-200 ease-out data-entering:translate-y-6 data-exiting:translate-y-6 md:max-w-[480px] md:rounded-[28px] md:data-entering:translate-y-0 md:data-entering:scale-95 md:data-exiting:scale-95",
          full ? "h-dvh md:h-auto md:max-h-[min(780px,90dvh)]" : "max-h-[min(780px,92dvh)]",
        )}
      >
        <Dialog className="flex min-h-0 flex-1 flex-col outline-none">
          {({ close }) => (
            <>
              <div className="flex-none px-5 pt-2.5">
                <div
                  className="mx-auto h-[5px] w-10 rounded-full bg-base-300 md:hidden"
                  aria-hidden
                />
                <div className="mt-3 flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <Heading
                      slot="title"
                      className="m-0 font-heading text-2xl leading-[1.15] font-extrabold [overflow-wrap:anywhere]"
                    >
                      {title}
                    </Heading>
                    {subline ? (
                      <p className="mt-1 text-sm leading-snug font-semibold text-muted">
                        {subline}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={close}
                    className="-mt-1 -mr-1.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-base-200"
                  >
                    <X className="size-[18px]" strokeWidth={2.6} aria-hidden />
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-7">{children}</div>
              {footer ? <div className="flex-none px-5 pt-2 pb-safe md:pb-5">{footer}</div> : null}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
