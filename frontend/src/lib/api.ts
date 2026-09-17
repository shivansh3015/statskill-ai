const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  'http://127.0.0.1:8000'
).replace(/\/+$/, '');


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedEndpoint =
    endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

  const url =
    `${API_BASE_URL}${normalizedEndpoint}`;

  try {
    const response = await fetch(
      url,
      {
        ...options,

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',

          ...(options.headers ?? {}),
        },

        cache:
          'no-store',
      }
    );


    const responseText =
      await response.text();


    if (!response.ok) {
      let errorMessage =
        responseText ||
        response.statusText ||
        'Request failed';


      /*
       * FastAPI normally returns errors as:
       *
       * {
       *   "detail": "Error message"
       * }
       */
      if (responseText) {
        try {
          const parsedError =
            JSON.parse(
              responseText
            ) as {
              detail?:
                string |
                unknown;
              message?:
                string;
            };


          if (
            typeof parsedError.detail ===
            'string'
          ) {
            errorMessage =
              parsedError.detail;
          } else if (
            typeof parsedError.message ===
            'string'
          ) {
            errorMessage =
              parsedError.message;
          }

        } catch {
          /*
           * Keep the original response text
           * when the server did not return JSON.
           */
        }
      }


      throw new Error(
        `API Error ${response.status}: ${errorMessage}`
      );
    }


    /*
     * Some successful API endpoints may return
     * an empty body.
     */
    if (!responseText) {
      return undefined as T;
    }


    try {
      return JSON.parse(
        responseText
      ) as T;

    } catch {
      throw new Error(
        `Invalid JSON response from ${url}`
      );
    }

  } catch (error) {
    /*
     * Preserve API errors created above.
     */
    if (
      error instanceof Error &&
      error.message.startsWith(
        'API Error'
      )
    ) {
      throw error;
    }


    if (
      error instanceof Error &&
      error.message.startsWith(
        'Invalid JSON'
      )
    ) {
      throw error;
    }


    console.error(
      'API request failed:',
      {
        url,
        method:
          options.method ??
          'GET',
        error,
      }
    );


    throw new Error(
      error instanceof Error
        ? `Unable to connect to backend: ${error.message}`
        : 'Unable to connect to backend.'
    );
  }
}


export async function apiGet<T>(
  endpoint: string
): Promise<T> {
  return request<T>(
    endpoint,
    {
      method:
        'GET',
    }
  );
}


export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return request<T>(
    endpoint,
    {
      method:
        'POST',

      body:
        body !== undefined
          ? JSON.stringify(
              body
            )
          : undefined,
    }
  );
}


export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return request<T>(
    endpoint,
    {
      method:
        'PUT',

      body:
        body !== undefined
          ? JSON.stringify(
              body
            )
          : undefined,
    }
  );
}


export async function apiDelete<T>(
  endpoint: string
): Promise<T> {
  return request<T>(
    endpoint,
    {
      method:
        'DELETE',
    }
  );
}


export {
  API_BASE_URL,
};