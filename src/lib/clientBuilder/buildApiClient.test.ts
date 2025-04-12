import { getServer } from "@/support/msw/node";
import { buildApiClient, EndpointDefinition } from "./buildApiClient";
import { http } from "msw";
import * as z from "zod";

describe(buildApiClient, () => {
  describe("GET", () => {
    it("Without args", async () => {
      const mockFn = jest.fn();
      getServer().use(
        http.get("http://localhost/test-api", async () => {
          mockFn();
          return Response.json(null);
        })
      );
      const client = buildApiClient({
        alias: "testApi",
        path: "/test-api",
        method: "GET",
        response: {
          contentType: "application/json",
          body: z.any(),
        },
      } as const satisfies EndpointDefinition);
      await client.testApi();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
