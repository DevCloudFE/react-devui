import 'i18next';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import resources from '../dist/resources.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    resources: typeof resources['en-US'];
  }
}
