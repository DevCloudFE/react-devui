# 接口

```ts
type DId = string | number;

type DSize = 'smaller' | 'larger';

type DLang = 'en-US' | 'zh-CN';

type DCloneHTMLElement<P = React.HTMLAttributes<HTMLElement>> = (el: React.ReactElement<P>) => React.ReactElement<P>;
```
