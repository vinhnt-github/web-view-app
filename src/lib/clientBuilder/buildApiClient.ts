import { z, infer as ZodInfer, ZodMapDef, ZodSchema } from "zod";
import {
  ApiClientHTTPErr,
  ApiClientNetworkErr,
  APIClientSchemaValidationErr,
} from "./error";
import { env } from "@/config/env";
import { ParseEventStream } from "../utils/streamUtil/ParseEventStream";
import { ExtractDataaJSONStream } from "../utils/streamUtil/ExtractDataaJSONStream";

export type Path = `/${string}`;
type EndpointDefinitionBase<TPath extends Path> = {
  readonly alias: string;
  readonly description?: string;
  readonly path: string;
};

export type GetEndpointDefinition<TPath extends Path> =
  EndpointDefinitionBase<TPath> & {
    readonly method: "GET";
    readonly request?: never;
    readonly response: {
      readonly contentType: "application/json";
      readonly body: ZodSchema;
    };
  };

export type PostEndpointDefination<TPath extends Path> =
  EndpointDefinitionBase<TPath> & {
    readonly method: "POST";
    readonly request: {
      body: ZodSchema;
    };
    readonly response: | {
      readonly contentType: "application/json";
      readonly body: ZodSchema;
    } | {
      readonly contentType: "text/event-stream";
      readonly body: ZodSchema;
    };
  };

export type EndpointDefinition<TPath extends Path = Path> =
  | GetEndpointDefinition<TPath>
  | PostEndpointDefination<TPath>;

export type ApiClientConfig = {
  readonly baseUrl?: string;
  readonly header?: Record<string, string>;
};

export type RequestOption = {
  readonly headers?: Record<string, string>;
};

type ExtractReqBodyType<TDef extends EndpointDefinition<Path>> = Exclude<
  TDef["request"],
  undefined
>["body"];

type InferArguments<TDef extends EndpointDefinition<Path>> =
  "request" extends keyof TDef
  ? ExtractReqBodyType<TDef> extends infer S extends ZodSchema
  ? [ZodInfer<S>] | [ZodInfer<S>, RequestOption]
  : never
  : [] | [RequestOption];

type InferResponse<TDef extends EndpointDefinition<Path>> =
  TDef["response"]["contentType"] extends "application/json"
  ? "body" extends keyof TDef["response"]
  ? TDef["response"]["body"] extends ZodSchema
  ? ZodInfer<TDef["response"]["body"]>
  : never
  : never
  : never;
type Configurable = {
  readonly getConfig: (config: ApiClientConfig) => void;
};

type EndpointFn<TDef extends EndpointDefinition<Path>> = (
  ...args: InferArguments<TDef>
) => Promise<InferResponse<TDef>>;

type InferAPI<
  TDefs extends EndpointDefinition<Path>[],
  X = Record<string, never>
> = TDefs extends []
  ? X
  : TDefs extends [
    infer THead extends EndpointDefinition<Path>,
    ...infer TRest extends EndpointDefinition<Path>[]
  ]
  ? X & InferAPI<TRest, { [K in THead["alias"]]: EndpointFn<THead> }>
  : never;

function createEndpointFn<TDef extends EndpointDefinition<Path>>(
  def: TDef,
  getConfig: () => ApiClientConfig
) {
  return async (...arg: InferArguments<TDef>) => {
    const url = (getConfig()?.baseUrl ?? "") + def.path;
    let body;
    let options: RequestOption | undefined = undefined;
    if (def.method !== "GET") {
      const reqBodyJson = arg[0];
      if (!reqBodyJson) {
        throw new Error("Request body is required");
      }
      const data = def.request.body.parse(reqBodyJson);
      body = JSON.stringify(data);
    } else {
      options = arg[0];
      body = undefined;
    }
    const res = await fetch(url, {
      method: def.method,
      body,
      headers: {
        ...getConfig().header,
        ...options?.headers,
        "Content-Type": "application/json",
      },
    }).catch((reason) => {
      console.log("reason", reason);
      return Promise.reject(new ApiClientNetworkErr("Fail to fetch", { url }));
    });

    if (!res.ok) {
      throw new ApiClientHTTPErr(res.statusText, {
        url,
        statusCode: res.status,
      });
    }

    // Parse res if response content type is application/json
    if (def.response.contentType === "application/json") {
      if (!res.headers.get("Content-Type")?.startsWith("application/json")) {
        throw new APIClientSchemaValidationErr(
          `Response Content-Type header is not "application/json"!`,
          {
            url,
          }
        );
      }

      const unparsed = await res.json();

      // Validate response body by ZodSchema
      return def.response.body.parse(unparsed);
    }
    else if (def.response.contentType === "text/event-stream") {
      if (!res.headers.get("Content-Type")?.includes("text/event-stream")) {
        throw new APIClientSchemaValidationErr(
          `Response Content-Type header is not "text/event-stream"!`,
          {
            url,
          }
        );
      }
      if (!res.body) {
        throw new APIClientSchemaValidationErr(
          "Stream response has no body!",
          {
            url,
          }
        );
      }
      return res.body
        .pipeThrough(new ParseEventStream()) // Return the raw response for SSE handling
        .pipeThrough(new ExtractDataaJSONStream())
    }
    else {
      // TODO: handle other Content-Type "text/evet-stream"
      throw new APIClientSchemaValidationErr(
        `API not support other Content-Type header`,
        {
          url,
        }
      );
    }
  };
}

export function buildApiClient<TDefs extends EndpointDefinition<Path>[]>(
  ...defs: TDefs
): InferAPI<TDefs> & Configurable {
  let currentConfig: ApiClientConfig = {
    baseUrl: env.API_BASE_URL,
  };
  const getConfig = () => currentConfig;
  const clientApi: any = defs.reduce(
    (acc, def) => {
      return {
        ...acc,
        [def.alias]: createEndpointFn(def, getConfig),
      };
    },
    {
      setConfig: (config: ApiClientConfig) => (currentConfig = {
        ...currentConfig,
        ...config,
      }),
    }
  );
  return clientApi;
}
