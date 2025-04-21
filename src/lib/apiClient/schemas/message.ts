import { z } from "zod";

const PlainTextStructSchema = z.object({
    id: z.string(),
    content: z.string(),
});

export const MessageResponseSchema = z.union([PlainTextStructSchema, z.any()]);
export type MessageResponse = z.infer<typeof MessageResponseSchema>;

export const MessageRequestSchema = z.object({
    message: z.string(),
})
export type MessageRequest = z.infer<typeof MessageRequestSchema>;



