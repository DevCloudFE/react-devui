import { isNull } from 'lodash';

import { base64url } from '../app/utils';
import { environment } from '../environments';

export const TOKEN_KEY = 'token';
export const TOKEN_TYPE: 'JWT' | 'CUSTOM' = 'JWT';
export const TOKEN_EXPIRATION_OFFSET = 10 * 1000;
export const TOKEN_REFRESH = true;
export const TOKEN_REFRESH_OFFSET = 60 * 1000;

if (!environment.production) {
  if (TOKEN_REFRESH && TOKEN_REFRESH_OFFSET <= TOKEN_EXPIRATION_OFFSET) {
    console.warn('`TOKEN_REFRESH_OFFSET` should be greater than `TOKEN_EXPIRATION_OFFSET`');
  }
}

export interface TokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
}

interface TokenInterface {
  // The number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
  expiration: number | null;
}

export class Token {
  public get token(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }
  public set token(val: string | null) {
    if (typeof window !== 'undefined') {
      if (isNull(val)) {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        localStorage.setItem(TOKEN_KEY, val);
      }
    }
  }
}

export class JWTToken<T extends TokenPayload> extends Token implements TokenInterface {
  public get payload(): T | null {
    if (isNull(this.token)) {
      return null;
    }
    const [, payload] = this.token.split('.');
    return JSON.parse(base64url.decode(payload));
  }
  public get expiration(): number | null {
    return this.payload ? this.payload.exp * 1000 : null;
  }
  public set expiration(val: number | null) {
    throw new Error('You should not change `expiration` when use JWT!');
  }
}
class CustomToken extends Token implements TokenInterface {
  public expiration: number | null = null;
}
export const TOKEN = TOKEN_TYPE === 'JWT' ? new JWTToken() : new CustomToken();
