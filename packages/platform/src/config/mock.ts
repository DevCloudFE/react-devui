import type { NotificationItem, UserState } from './state';
import type { JWTToken, TokenPayload } from './token';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { base64url } from '../app/utils';
import { environment } from '../environments';
import { ROUTES_ACL } from './acl';
import { TOKEN } from './token';

if (environment.mock) {
  const mock = new MockAdapter(axios);
  const withDelay =
    <T>(delay: number, response: T) =>
    () => {
      return new Promise<T>((resolve) => {
        setTimeout(() => {
          resolve(response);
        }, delay);
      });
    };

  const admin: UserState = {
    name: 'admin',
    avatar: '/assets/imgs/avatar.png',
    role: 'admin',
    permission: [],
  };
  const user: UserState = {
    name: 'user',
    avatar: '/assets/imgs/avatar.png',
    role: 'user',
    permission: [0, ROUTES_ACL.test.acl, ROUTES_ACL.test.http],
  };
  const notification: NotificationItem[] = [
    {
      id: '1',
      title: 'Title1',
      list: Array.from({ length: 4 }).map((_, i) => ({ message: `This is message ${i}`, read: i === 1 })),
    },
    {
      id: '2',
      title: 'Title2',
      list: Array.from({ length: 2 }).map((_, i) => ({ message: `This is message ${i}`, read: false })),
    },
    {
      id: '3',
      title: 'Title3',
      list: Array.from({ length: 3 }).map((_, i) => ({ message: `This is message ${i}`, read: false })),
    },
  ];

  mock.onGet('/api/notification').reply(withDelay(500, [200, notification]));

  mock
    .onGet('/api/auth/me')
    .reply(withDelay(500, [200, (TOKEN as JWTToken<TokenPayload & { admin: boolean }>).payload?.admin ? admin : user]));

  for (const username of ['admin', 'user']) {
    mock.onPost('/api/login', { username }).reply(
      withDelay(500, [
        200,
        {
          user: username === 'admin' ? admin : user,
          token: `${base64url.encode(JSON.stringify({}))}.${base64url.encode(
            JSON.stringify({ exp: ~~(Date.now() / 1000) + 6 * 60 * 60, admin: username === 'admin' })
          )}.signature`,
        },
      ])
    );
  }

  mock
    .onPost('/api/auth/refresh')
    .reply(
      withDelay(500, [
        200,
        `${base64url.encode(JSON.stringify({}))}.${base64url.encode(
          JSON.stringify({ exp: ~~(Date.now() / 1000) + 6 * 60 * 60 })
        )}.signature`,
      ])
    );

  for (const status of [401, 403, 404, 500]) {
    mock.onPost('/api/test/http', { status }).reply(status);
  }
}
