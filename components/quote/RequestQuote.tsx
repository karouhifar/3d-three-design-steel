"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, X } from "lucide-react";
import { useBuilding } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function RequestQuote() {
  const { config } = useBuilding();
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  // close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: hook up to your API / CRM here.
    // The full `config` object is the payload to send.
    // eslint-disable-next-line no-console
    console.log("Request Quote payload:", config);
    setSent(true);
  }

  return (
    <>
      <Button className="w-full" size="lg" onClick={() => setOpen(true)}>
        <FileText className="h-4 w-4" />
        Request Quote
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Request a quote"
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {sent ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <h3 className="mt-3 text-lg font-semibold">Request received</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your building configuration has been captured. A specialist
                    will reach out shortly.
                  </p>
                  <Button
                    className="mt-5"
                    variant="outline"
                    onClick={() => {
                      setSent(false);
                      setOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">Request your quote</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Send us your custom design — {config.width}′×{config.length}′×
                    {config.height}′ steel building.
                  </p>
                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <Field id="name" label="Full name" />
                    <Field id="email" label="Email" type="email" />
                    <Field id="zip" label="Project ZIP code" />
                    <div className="space-y-1.5">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Timeline, site details, etc."
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Submit request
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({
  id,
  label,
  type = "text",
}: {
  id: string;
  label: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type={type}
        required
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      />
    </div>
  );
}
