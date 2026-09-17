export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role?: string | null;
  department?: string | null;
};

const AUTH_USER_KEY =
  'statskill_auth_user';

const AUTH_USER_ID_KEY =
  'statskill_user_id';

export function setCurrentUser(
  user: AuthUser
): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify(user)
  );

  localStorage.setItem(
    AUTH_USER_ID_KEY,
    String(user.id)
  );
}

export function getCurrentUser():
  | AuthUser
  | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw =
    localStorage.getItem(
      AUTH_USER_KEY
    );

  if (!raw) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(raw) as AuthUser;

    if (
      !parsed ||
      typeof parsed.id !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getCurrentUserId():
  | number
  | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const user = getCurrentUser();

  if (user?.id) {
    return user.id;
  }

  const storedId =
    localStorage.getItem(
      AUTH_USER_ID_KEY
    );

  if (!storedId) {
    return null;
  }

  const parsedId =
    Number(storedId);

  return Number.isInteger(parsedId) &&
    parsedId > 0
    ? parsedId
    : null;
}

export function isAuthenticated(): boolean {
  return getCurrentUserId() !== null;
}

export function clearCurrentUser(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(
    AUTH_USER_KEY
  );

  localStorage.removeItem(
    AUTH_USER_ID_KEY
  );
}
