import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255, { message: "Email muito longo" }),
  password: z.string().min(1, { message: "Senha é obrigatória" }).max(128, { message: "Senha muito longa" }),
});

export const signupSchema = z.object({
  fullName: z.string().trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome muito longo" })
    .regex(/^[a-zA-ZÀ-ÿ\s.'-]+$/, { message: "Nome contém caracteres inválidos" }),
  email: z.string().trim().email({ message: "Email inválido" }).max(255, { message: "Email muito longo" }),
  password: z.string()
    .min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
    .max(128, { message: "Senha muito longa" })
    .regex(/[A-Z]/, { message: "Senha deve conter pelo menos uma letra maiúscula" })
    .regex(/[a-z]/, { message: "Senha deve conter pelo menos uma letra minúscula" })
    .regex(/[0-9]/, { message: "Senha deve conter pelo menos um número" }),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Você deve aceitar os termos" }) }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255, { message: "Email muito longo" }),
});

export const profileSchema = z.object({
  fullName: z.string().trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome muito longo" })
    .regex(/^[a-zA-ZÀ-ÿ\s.'-]+$/, { message: "Nome contém caracteres inválidos" }),
  oab: z.string().trim().max(20, { message: "OAB muito longa" }).optional().or(z.literal("")),
  whatsappPhone: z.string().trim().max(20, { message: "Telefone muito longo" })
    .regex(/^[\d()\s+-]*$/, { message: "Telefone contém caracteres inválidos" })
    .optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
