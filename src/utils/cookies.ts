// Cookie utility functions to comply with linting rules

export function setCookie(
  name: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    sameSite?: "strict" | "lax" | "none";
    secure?: boolean;
  } = {},
) {
  const { path = "/", maxAge, sameSite = "lax", secure = false } = options;

  let cookieString = `${name}=${value}; path=${path}; samesite=${sameSite}`;

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  }

  if (secure) {
    cookieString += "; secure";
  }

  document.cookie = cookieString;
}

export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
}

export function deleteCookie(name: string, path = "/") {
  document.cookie = `${name}=; path=${path}; max-age=0`;
}
