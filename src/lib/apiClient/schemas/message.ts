import { z } from "zod";

export const MessageRole = z.enum(["user", "assistant"]);
export type MessageRole = z.infer<typeof MessageRole>;

const PlainTextStructSchema = z.object({
    id: z.string(),
    role: MessageRole,
    content: z.string(),
});

export const MessageResponseSchema = PlainTextStructSchema
export type MessageResponse = z.infer<typeof MessageResponseSchema>;

export const MessageRequestSchema = z.object({
    message: z.string(),
})
export type MessageRequest = z.infer<typeof MessageRequestSchema>;



