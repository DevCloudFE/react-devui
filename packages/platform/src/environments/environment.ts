// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

export const environment = {
  production: false,
  http: {
    mock: true,
    baseURL: 'https://test.example.com',
    transformURL: (url: string) => {
      return '/api/v1' + url;
    },
  },
};
