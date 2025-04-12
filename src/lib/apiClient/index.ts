import {
  buildApiClient,
  EndpointDefinition,
} from "../clientBuilder/buildApiClient";
import { UserResponseSchema } from "./schemas/schemas";

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

export const apiClient = buildApiClient(GetUserAPIDef);
