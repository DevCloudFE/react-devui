import type { NotificationItem, UserState } from '../../../config/state';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { environment } from '../../../environments';
import { base64url } from '../../utils';

if (environment.mock) {
  const mock = new MockAdapter(axios, { delayResponse: 500 });
  const user: UserState = {
    name: 'admin',
    avatar: '/assets/avatar.png',
    role: 'admin',
    permission: [],
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

  mock.onPost('/api/login').reply(200, {
    user,
    token: `${base64url.encode(JSON.stringify({}))}.${base64url.encode(
      JSON.stringify({ exp: ~~(Date.now() / 1000) + 6 * 60 * 60 })
    )}.signature`,
  });

  mock
    .onPost('/api/auth/refresh')
    .reply(
      200,
      `${base64url.encode(JSON.stringify({}))}.${base64url.encode(JSON.stringify({ exp: ~~(Date.now() / 1000) + 6 * 60 * 60 }))}.signature`
    );

  mock.onGet('/api/auth/me').reply(200, user);

  mock.onGet('/api/notification').reply(200, notification);
}
