"use client";

import { useEffect } from "react";
import { SomethingWentWrongScene } from "@/components/illustrations/scenes/something-went-wrong";
import { Pill, StatusScreen } from "@/components/kit";

type ErrorProps = {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
};

export default function Error({ error, reset, unstable_retry }: ErrorProps) {
  const retry = unstable_retry ?? reset;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
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
  );
}
