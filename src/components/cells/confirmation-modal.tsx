"use client";

import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/atoms/alert-dialog";

type Props = {
  opened: boolean;
  onOpenAction: (value: boolean) => void;
  action: () => void;
  title: string;
  message: string | ReactNode;
  labels?: {
    close?: string;
    confirm?: string;
  };
};

export function ConfirmationModal({
  opened,
  onOpenAction,
  action,
  labels,
  title,
  message
}: Props) {
  return (
    <AlertDialog open={opened} onOpenChange={onOpenAction}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{message}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{labels?.close ?? "Cancel"}</AlertDialogCancel>
          <AlertDialogAction onClick={() => action()}>
            {labels?.confirm ?? "OK"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
