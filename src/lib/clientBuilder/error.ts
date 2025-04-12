type APIClientErrOtion = {
  readonly url: string;
} & ConstructorParameters<typeof Error>[1];

type ApiClientHTTPErrOption = {
  readonly statusCode: number;
} & APIClientErrOtion;

// Represents a generic error related to the API client, including information about the URL.
export class APIClientErr extends Error {
  readonly name: string = "APIClientErr";
  readonly origin: string;
  readonly pathname: string;
  constructor(message: string, { url, ...rest }: APIClientErrOtion) {
    const urlObj = safeParseUrl(url);
    super(message, rest);
    this.origin = urlObj?.origin ?? "";
    this.pathname = urlObj?.pathname ?? "";
  }
}

// Represents a network-related error in the API client, such as connection issues.
export class ApiClientNetworkErr extends APIClientErr {
  readonly name: string = "ApiClientNetworkErr";
}

// Represents an HTTP error in the API client, including the HTTP status code.
export class ApiClientHTTPErr extends APIClientErr {
  readonly name: string = "ApiClientHTTPErr";
  readonly statusCode: number;
  constructor(
    message: string,
    { statusCode, ...rest }: ApiClientHTTPErrOption
  ) {
    super(message, rest);
    this.statusCode = statusCode;
  }
}
export class APIClientSchemaValidationErr extends APIClientErr {
  readonly name: string = "APIClientSchemaValidationErr";
}

const safeParseUrl = (urlString: string) => {
  try {
    return new URL(urlString);
  } catch {
    return null;
  }
};
