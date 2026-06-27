"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { useBuilding } from "@/lib/store";
import { leadSchema, type LeadInput } from "@/lib/quote-schema";
import { footprint, roofArea, countByType } from "@/lib/building";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function RequestQuote() {
  const { config } = useBuilding();
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", email: "", phone: "", postal: "", notes: "" },
  });

  // close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
  }

  async function onSubmit(lead: LeadInput) {
    setServerError(null);
    const payload = {
      lead,
      config,
      summary: {
        footprintSqFt: footprint(config),
        roofAreaSqFt: roofArea(config),
        garageDoors: countByType(config.openings, "garage"),
        manDoors: countByType(config.openings, "man"),
        windows: countByType(config.openings, "window"),
      },
      meta: {
        source: "3d-designer",
        submittedAt: new Date().toISOString(),
      },
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setServerError(
          res.status === 422
            ? "Some details look invalid. Please review and try again."
            : "We couldn't submit your request. Please try again shortly.",
        );
        return;
      }
      setSent(true);
      reset();
    } catch {
      setServerError("Network error. Check your connection and try again.");
    }
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
              onClick={close}
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
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {sent ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                  <h3 className="mt-3 text-lg font-semibold">
                    Request received
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your building configuration has been sent to North GTA
                    Steel. A specialist will reach out shortly.
                  </p>
                  <Button
                    className="mt-5"
                    variant="outline"
                    onClick={() => {
                      setSent(false);
                      close();
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">Request your quote</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Send us your custom design — {config.width}′×{config.length}
                    ′×
                    {config.height}′ steel building.
                  </p>

                  {serverError && (
                    <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="mt-5 space-y-4"
                  >
                    <Field
                      id="name"
                      label="Full name"
                      error={errors.name?.message}
                      {...register("name")}
                    />
                    <Field
                      id="email"
                      label="Email"
                      type="email"
                      error={errors.email?.message}
                      {...register("email")}
                    />
                    <Field
                      id="phone"
                      label="Phone (optional)"
                      type="tel"
                      error={errors.phone?.message}
                      {...register("phone")}
                    />
                    <Field
                      id="postal"
                      label="Project postal / ZIP code (optional)"
                      {...register("postal")}
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="Timeline, site details, etc."
                        {...register("notes")}
                      />
                      {errors.notes?.message && (
                        <p className="text-xs text-destructive">
                          {errors.notes.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {isSubmitting ? "Submitting…" : "Submit request"}
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

const Field = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(({ id, label, error, ...props }, ref) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <input
      id={id}
      ref={ref}
      aria-invalid={!!error}
      className={cn(
        "w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        error ? "border-destructive" : "border-input",
      )}
      {...props}
    />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
));
Field.displayName = "Field";
