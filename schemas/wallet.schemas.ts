import { z } from "zod";

export const walletTypeSchema = z.enum(["CASH", "MOBILE_MONEY", "BANK", "DEBT"]);

export const automaticIncomeTypeSchema = z.enum(["NOT_SPECIFIED", "MENSUAL"]);

export const creationWalletSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must not exceed 50 characters"),
  description: z
    .string()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
  type: walletTypeSchema,
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional()
    .default("#00ff00"),
  iconRef: z.string().optional(),
});

export type CreationWalletFormData = z.infer<typeof creationWalletSchema>;

export const updateWalletSchema = creationWalletSchema.extend({
  id: z.string().uuid("Invalid wallet ID"),
  accountId: z.string().uuid("Invalid account ID"),
  isActive: z.boolean(),
});

export type UpdateWalletFormData = z.infer<typeof updateWalletSchema>;

export const automaticIncomeSchema = z.object({
  type: automaticIncomeTypeSchema,
  amount: z.number().min(0, "Amount must be positive"),
  paymentDay: z.number().min(1).max(31).optional(),
}).refine((data) => {
  if (data.type === "MENSUAL" && !data.paymentDay) {
    return false;
  }
  return true;
}, {
  message: "Payment day is required for mensual automatic income",
  path: ["paymentDay"],
});

export type AutomaticIncomeFormData = z.infer<typeof automaticIncomeSchema>;
