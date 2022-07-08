export type DLang = 'en-US' | 'zh-Hant';

export type DId = string | number;

export type DSize = 'smaller' | 'larger';

export type DNestedChildren<T> = T & { children?: DNestedChildren<T>[] };

export const SSR_ENV = typeof window === 'undefined';

export const TTANSITION_DURING_SLOW = 300;
export const TTANSITION_DURING_BASE = 200;
export const TTANSITION_DURING_FAST = 100;
export const TTANSITION_DURING_POPUP = 116;
