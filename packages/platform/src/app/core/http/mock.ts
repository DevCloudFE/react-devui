import type { DeviceDoc } from '../../hooks/api/types';
import type { UserState, NotificationItem } from '../state';
import type { JWTToken, JWTTokenPayload } from '../token';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { environment } from '../../../environments';
import { ROLE_ACL, ROUTES_ACL } from '../../config/acl';
import { base64url } from '../../utils';
import { TOKEN } from '../token';

if (environment.http.mock) {
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
    permission: [ROLE_ACL.super_admin],
  };
  const user: UserState = {
    name: 'user',
    avatar: '/assets/imgs/avatar.png',
    permission: [0, ROUTES_ACL['/test/acl'], ROUTES_ACL['/test/http']],
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
  const deviceList = Array.from({ length: 108 }).map<DeviceDoc>((_, i) => ({
    id: i,
    create_time: Date.now() + 60 * 60 * 1000,
    update_time: Date.now() + 60 * 60 * 1000,
    name: `Device ${i}`,
    model: `Model ${~~(Math.random() * 9) % 3}`,
    price: ~~(Math.random() * 1000),
    status: ~~(Math.random() * 9) % 3,
  }));

  mock.onGet('/api/v1/notification').reply(withDelay(500, [200, notification]));

  mock
    .onGet('/api/v1/auth/me')
    .reply(withDelay(500, [200, (TOKEN as JWTToken<JWTTokenPayload & { admin: boolean }>).payload?.admin ? admin : user]));

  for (const username of ['admin', 'user']) {
    mock.onPost('/api/v1/auth/login', { username }).reply(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            200,
            {
              user: username === 'admin' ? admin : user,
              token: `${base64url.encode(JSON.stringify({}))}.${base64url.encode(
                JSON.stringify({
                  exp: ~~((Date.now() + 2 * 60 * 60 * 1000) / 1000),
                  admin: username === 'admin',
                })
              )}.signature`,
            },
          ]);
        }, 500);
      });
    });
  }

  mock.onPost('/api/v1/auth/refresh').reply(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          200,
          `${base64url.encode(JSON.stringify({}))}.${base64url.encode(
            JSON.stringify({
              exp: ~~((Date.now() + 2 * 60 * 60 * 1000) / 1000),
              admin: (TOKEN as JWTToken<JWTTokenPayload & { admin: boolean }>).payload?.admin,
            })
          )}.signature`,
        ]);
      }, 500);
    });
  });

  for (const status of [401, 403, 404, 500]) {
    mock.onPost('/api/v1/test/http', { status }).reply(status);
  }

  mock.onGet('/api/v1/device').reply((config) => {
    const data = JSON.parse(config.data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          200,
          {
            resources: deviceList.slice((data.page - 1) * data.page_size, data.page * data.page_size),
            metadata: {
              page: data.page,
              page_size: data.page_size,
              total_size: deviceList.length,
            },
          },
        ]);
      }, 500);
    });
  });

  mock.onGet(/\/api\/v1\/device\/[0-9]+/).reply((config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([200, deviceList.find((device) => device.id === Number(config.url!.match(/[0-9]+$/)![0]))]);
      }, 500);
    });
  });

  mock.onGet('/api/v1/device/model').reply(
    withDelay(500, [
      200,
      {
        resources: Array.from({ length: 4 }).map((_, index) => ({
          name: `Model ${index}`,
          disabled: index === 3,
        })),
        metadata: {},
      },
    ])
  );
}
