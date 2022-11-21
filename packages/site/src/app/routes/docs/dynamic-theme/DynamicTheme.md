# Dynamic Theme

## How to use

Through clever style design, we have achieved theme customization with a small number of css variables!

Check out our [dark theme](https://github.com/DevCloudFE/react-devui/blob/main/packages/ui/src/styles/theme-dark.scss).

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
