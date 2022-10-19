import { isNull } from 'lodash';

import { useStorage } from '@react-devui/hooks';

import { base64url } from '../../app/utils';
import { environment } from '../../environments';

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

export abstract class Token {
  public abstract get expiration(): number | null;
  public abstract set expiration(val: number | null);

  public get value(): string | null {
    return useStorage.SERVICE.getItem(TOKEN_KEY);
  }

  public get expired(): boolean {
    if (isNull(this.expiration)) {
      return false;
    } else {
      return this.expiration - TOKEN_EXPIRATION_OFFSET <= Date.now();
    }
  }

  set(val: string | null) {
    useStorage.SERVICE.setItem(TOKEN_KEY, val);
  }
  remove() {
    useStorage.SERVICE.removeItem(TOKEN_KEY);
  }
}

export interface JWTTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
}
export class JWTToken<T extends JWTTokenPayload> extends Token {
  public get payload(): T | null {
    if (isNull(this.value)) {
      return null;
    }
    const [, payload] = this.value.split('.');
    return JSON.parse(base64url.decode(payload));
  }
  public get expiration(): number | null {
    return isNull(this.payload) ? null : this.payload.exp * 1000;
  }
  public set expiration(val: number | null) {
    throw new Error('You should not change `expiration` when use JWT!');
  }
}

export class CustomToken extends Token {
  public expiration: number | null = null;
}

export const TOKEN = TOKEN_TYPE === 'JWT' ? new JWTToken() : new CustomToken();
