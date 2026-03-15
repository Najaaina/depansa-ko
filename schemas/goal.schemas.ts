import { z } from "zod";

// export const labelIconsSchema = z.enum(["WORK","SCHOOL","TRANSPORT","HEALTH", "MISC", "FOOD","ENTERTAINEMENT","SHOPPING"]);

export const goalFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must not exceed 50 characters"),
    amount: z.string(),
    startingDate: z.string(),
    endingDate: z.string(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
      .optional()
      .default("#00ff00"),
  })
  .refine((data) => data.startingDate < data.endingDate, {
    message: "The starting date must be before the ending date",
    path: ["endignDate"],
  });

export type GoalFormData = z.infer<typeof goalFormSchema>;
