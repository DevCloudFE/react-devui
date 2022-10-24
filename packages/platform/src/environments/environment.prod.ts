export const environment = {
  production: true,
  http: {
    mock: true,
    baseURL: 'https://example.com',
    transformURL: (url: string) => {
      return '/api/v1' + url;
    },
  },
};
