# 动态主题

## 如何使用

通过巧妙的样式设计，我们实现了通过少量的 css 变量即可完成主题定制！

参考我们的[暗黑主题](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/src/styles/theme-dark.scss)。

```tsx
export default function App() {
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    if (theme === 'dark') {
      const colorScheme = document.documentElement.style.colorScheme;
      document.documentElement.style.colorScheme = 'dark';
      return () => {
        document.documentElement.style.colorScheme = colorScheme;
      };
    }
  }, [theme]);
}
```
