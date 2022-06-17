export type DLang = 'en-US' | 'zh-Hant';
export type DTheme = 'light' | 'dark';

export type DId = string | number;

export type DSize = 'smaller' | 'larger';

export type DNestedChildren<T> = T & { children?: DNestedChildren<T>[] };

export const SSR_ENV = typeof window === 'undefined';

export function ICON_SIZE(size?: DSize) {
  return size === 'smaller' ? 12 : size === 'larger' ? 16 : 14;
}
