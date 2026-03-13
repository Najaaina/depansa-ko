import { z } from "zod";

// Login schemas
export const loginSchema = z.object({
  email: z
      .email({ message: "Please enter a valid email address" })
      .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register schemas
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, "Username must be at least 4 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          "Username can only contain letters, numbers, underscores and hyphens",
      }),
    email: z
      .email({ message: "Please enter a valid email address" })
      .min(1, "Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;


export const resetPasswordSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username must not exceed 20 characters"),
  oldPassword: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain uppercase, lowercase, and number",
    }),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;