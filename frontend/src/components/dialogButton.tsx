"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { ShimmerButtonDemo } from "./animatedButton2";
import { Button } from "./ui/button";

function DialogNewsletter() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div key={`trigger-${open ? "open" : "closed"}`}>
          <ShimmerButtonDemo />
        </div>
      </DialogTrigger>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-md" />
      <DialogContent
        className="bg-[#09090B] border border-[#27272A]"
        onEscapeKeyDown={handleClose}
        onInteractOutside={handleClose}
      >
        <div className="mb-2 flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gray-800"
            aria-hidden="true"
          >
            <svg
              className="stroke-white"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
            </svg>
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center text-white">
              TOP 10 Automatizaciones
            </DialogTitle>
            <DialogDescription className="sm:text-center text-gray-400">
              Descarga <b>gratis</b> las mejores automatizaciones.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="dialog-subscribe"
                className="peer ps-9 bg-[#0a0a0a] text-white placeholder:text-[#5b5b5b] border-gray-800 focus:border-white shadow-sm shadow-gray-700"
                placeholder="contacto@tuempresa.com"
                type="email"
                aria-label="Email"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-gray-400 peer-disabled:opacity-50">
                <Mail size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>
          <Button type="button" className="w-full bg-white hover:bg-gray-200">
            Subscríbete
          </Button>
        </form>
        <p className="text-center text-xs text-gray-400">
          Al suscribirte aceptas nuestra{" "}
          <Link
            href="/privacy"
            className="text-gray-400 underline hover:no-underline"
          >
            Política de Privacidad
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}

export { DialogNewsletter };
