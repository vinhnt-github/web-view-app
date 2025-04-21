import { z } from "zod";
import {
  buildApiClient,
  EndpointDefinition,
} from "../clientBuilder/buildApiClient";
import { UserResponseSchema } from "./schemas/schemas";
import { MessageRequestSchema, MessageResponseSchema } from "./schemas/message";

export const GetUserAPIDef = {
  alias: "getUserAPI",
  description: "Get user information",
  path: "/users",
  method: "GET",
  response: {
    contentType: "application/json",
    body: UserResponseSchema,
  },
} as const satisfies EndpointDefinition;

export const PostMessageAPIDef = {
  alias: "postMessageAPI",
  description: "Post a message",
  path: "/stream/chat/message",
  method: "POST",
  request: {
    body: MessageRequestSchema
  },
  response: {
    contentType: "text/event-stream",
    body: MessageResponseSchema,
  },
} as const satisfies EndpointDefinition;

export const apiClient = buildApiClient(GetUserAPIDef, PostMessageAPIDef);
