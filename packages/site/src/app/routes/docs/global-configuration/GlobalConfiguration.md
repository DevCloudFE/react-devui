# Global Configuration

Through our root component `DRoot`, you can configure our component library very conveniently, and all configuration items are listed below:

```tsx
interface DConfigContextData {
  // Namespace, affects `className`, e.g. set value to 'app', then 'rd-button' will become 'app-button'
  // Note: Need to modify the style sheet `$rd-namespace: 'app'` synchronously!
  namespace: string;
  // The global configuration of the component, the component Prop priority is: component > global configuration > default
  // For example: `{ DEmpty: { dDescription: 'Global configuration' } }` will modify the default description of the empty component
  componentConfigs: Partial<DComponentConfig>;
  // [Internationalization](/docs/Internationalization)
  i18n: {
    lang: DLang;
    resources: typeof resources;
  };
  // Page layout
  layout: {
    // Scroll container
    pageScrollEl?: DRefExtra;
    // Content container
    contentResizeEl?: DRefExtra;
  };
  // Whether to monitor global scrolling will cause unnecessary calculations, use with caution!
  // Calculations like popup position are mostly expected if the page layout is set up correctly
  // But if the page often contains nested scrolling, it is undoubtedly difficult to handle various position
  // calculations based on the scrolling events of each scrolling container. At this time, global scrolling can be monitored
  globalScroll: boolean;
}
```
