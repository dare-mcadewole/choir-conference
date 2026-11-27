"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  error: string | null;
  onClose: () => void;
  supportContact?: string;
};

export function RegistrationErrorDialog({
  error,
  onClose,
  supportContact,
}: Props) {
  return (
    <AlertDialog
      open={error !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Registration could not be completed
          </AlertDialogTitle>
          <AlertDialogDescription className="break-words">
            {error}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {supportContact && (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/${supportContact}?text=${encodeURIComponent(
                    `Hi support, I couldn't complete my registration: ${error}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Contact support
            </Button>
          )}
          <AlertDialogAction size="sm" onClick={onClose}>
            OKAY, GOT IT
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
