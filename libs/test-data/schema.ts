import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const environmentSchema = z.object({
  baseUrl: z.url(),
  users: z.record(z.string(), userSchema),
  messages: z.record(z.string(), z.string()),
});

export type User = z.infer<typeof userSchema>;
export type Environment = z.infer<typeof environmentSchema>;
