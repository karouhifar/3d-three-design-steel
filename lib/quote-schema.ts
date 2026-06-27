import { z } from "zod";

// ---- lead (the human-entered form) ----------------------------------------

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  postal: z
    .string()
    .trim()
    .max(12, "That postal code looks too long")
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, "Keep notes under 1000 characters")
    .optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// ---- building config (mirrors lib/building BuildingConfig) -----------------

const openingSchema = z.object({
  id: z.string(),
  type: z.enum(["garage", "man", "window"]),
  side: z.enum(["front", "back", "left", "right"]),
  offset: z.number().min(0).max(1),
});

export const buildingConfigSchema = z.object({
  width: z.number().positive(),
  length: z.number().positive(),
  height: z.number().positive(),
  roofPitch: z.number().positive(),
  roofStyle: z.enum(["regular", "boxed", "vertical"]),
  wallColor: z.string(),
  roofColor: z.string(),
  trimColor: z.string(),
  wainscot: z.boolean(),
  wainscotColor: z.string(),
  openings: z.array(openingSchema),
  addons: z.object({
    leanTo: z.boolean(),
    skylights: z.number().int().min(0),
    vents: z.number().int().min(0),
    gutters: z.boolean(),
    insulation: z.boolean(),
  }),
});

// ---- full request payload sent to /api/quote -------------------------------

export const quoteRequestSchema = z.object({
  lead: leadSchema,
  config: buildingConfigSchema,
  summary: z
    .object({
      footprintSqFt: z.number(),
      roofAreaSqFt: z.number(),
      garageDoors: z.number(),
      manDoors: z.number(),
      windows: z.number(),
    })
    .optional(),
  meta: z
    .object({
      source: z.string().optional(),
      submittedAt: z.string().optional(),
    })
    .optional(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
