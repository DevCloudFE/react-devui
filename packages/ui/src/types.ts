export type DLang = 'en-US' | 'zh-Hant';

export type DTheme = 'light' | 'dark';

export type DBreakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type DSize = 'smaller' | 'larger';

export type DId = string | number;

export type DNestedChildren<T> = T & { children?: DNestedChildren<T>[] };

export interface DGeneralState {
  gSize?: DSize;
  gDisabled: boolean;
}
