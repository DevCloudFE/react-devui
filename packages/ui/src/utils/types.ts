export type DId = string | number;

export type DSize = 'smaller' | 'larger';

export type DBreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type DBreakpoints = Record<DBreakpointKey, number>;

export type DLang = 'en-US' | 'zh-CN';

export type DCloneHTMLElement<P = React.HTMLAttributes<HTMLElement>> = (el: React.ReactElement<P>) => React.ReactElement<P>;

export {};
