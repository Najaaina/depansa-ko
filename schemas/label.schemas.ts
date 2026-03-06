import { z } from "zod";

export const labelIconsSchema = z.enum(["WORK","SCHOOL","TRANSPORT","HEALTH", "MISC", "FOOD","ENTERTAINEMENT","SHOPPING"]);

export const creationLabelSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must not exceed 50 characters"),
  iconRef: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional()
    .default("#00ff00"),
});

export type CreationLabelFormData = z.infer<typeof creationLabelSchema>;

// export const updateWalletSchema = creationWalletSchema.extend({
//   id: z.string().uuid("Invalid wallet ID"),
//   accountId: z.string().uuid("Invalid account ID"),
//   isActive: z.boolean(),
// });

// export type UpdateWalletFormData = z.infer<typeof updateWalletSchema>;