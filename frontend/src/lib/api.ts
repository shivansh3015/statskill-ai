import { getCurrentUserId } from '@/lib/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

const USER_SCOPED_PATHS = [
  '/dashboard/',
  '/competencies/',
  '/skill-gaps/',
  '/recommendations/',
  '/competency-history/',
  '/users/',
  '/ai/assessment/',
];

function applyLoggedInUserToEndpoint(
  endpoint: string
): string {
  const currentUserId =
    getCurrentUserId();

  if (!currentUserId) {
    return endpoint;
  }

  let nextEndpoint = endpoint;

  for (const prefix of USER_SCOPED_PATHS) {
    const escapedPrefix =
      prefix.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

    const pattern =
      new RegExp(
        `^${escapedPrefix}1(?=/|$|\\?)`
      );

    nextEndpoint =
      nextEndpoint.replace(
        pattern,
        `${prefix}${currentUserId}`
      );
  }

  nextEndpoint =
    nextEndpoint.replace(
      /([?&]user_id=)1(?=&|$)/g,
      `$1${currentUserId}`
    );

  return nextEndpoint;
}

function applyLoggedInUserToBody(
  body: unknown
): unknown {
  const currentUserId =
    getCurrentUserId();

  if (
    !currentUserId ||
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    return body;
  }

  const record =
    body as Record<string, unknown>;

  if (
    Object.prototype.hasOwnProperty.call(
      record,
      'user_id'
    )
  ) {
    return {
      ...record,
      user_id: currentUserId,
    };
  }

  return body;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const resolvedEndpoint =
    applyLoggedInUserToEndpoint(
      endpoint
    );

  const response = await fetch(
    `${API_BASE_URL}${resolvedEndpoint}`,
    {
      ...options,
      headers: {
        'Content-Type':
          'application/json',
        ...(options.headers || {}),
      },
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `API Error ${response.status}: ${
        errorText ||
        response.statusText
      }`
    );
  }

  return response.json();
}

export async function apiGet<T>(
  endpoint: string
): Promise<T> {
  return request<T>(
    endpoint,
    {
      method: 'GET',
    }
  );
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  const resolvedBody =
    body !== undefined
      ? applyLoggedInUserToBody(
          body
        )
      : undefined;

  return request<T>(
    endpoint,
    {
      method: 'POST',
      body:
        resolvedBody !== undefined
          ? JSON.stringify(
              resolvedBody
            )
          : undefined,
    }
  );
}

export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  const resolvedBody =
    body !== undefined
      ? applyLoggedInUserToBody(
          body
        )
      : undefined;

  return request<T>(
    endpoint,
    {
      method: 'PUT',
      body:
        resolvedBody !== undefined
          ? JSON.stringify(
              resolvedBody
            )
          : undefined,
    }
  );
}

export {
  API_BASE_URL,
};
