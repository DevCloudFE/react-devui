<h1 align="center">React DevUI</h1>

<p align="center">DevUI components based on React</p>

English | [简体中文](README.zh-Hant.md)

In development.

Need unit test support (Jest) 🤝

## Start

We add `chmod ug+x .husky/` at `prepare` that make sure the files is executable in linux. So you use other OS, just ignore error.

Execute the following command to preview the component:

```
yarn site:serve
```

For contributions, please refer to [Contribution Guide](CONTRIBUTING.md).

## Design Guidelines

### Code

- Use Hooks to complete the components.
- To maintain the independence of the components to the greatest extent, the use of component combination has completed more complex logic, for example: the Drawer component separates the Header, so that we can use the DrawerHeader alone instead of passing the Props of the Header to the Drawer component. More than that, separate components So that we don't have to worry about the future component functions are more and more difficult to maintain.
- Use structured comments to layer the code structure to keep the structure clear when the function component code is large, and provide guidance for migration to Angular and Vue.
- We provide `useAsync` to manage asynchronous functions. By intercepting asynchronous methods, such as `setTimeout`, we ensure that asynchronous functions will not be executed after the component is destroyed.
- Ensure that the component `Props` inherits `React.HTMLAttributes<HTMLElement>`, we hope that the use of the component is consistent with the DOM element.
- Don't introduce third-party components, we want the components to be completely controllable.
- For more details, please refer to the implementation of the typical [Drawer](https://github.com/xiejay97/react-devui/tree/main/ui/src/components/drawer) component.

### Style

- The class naming follows the [BEM](http://getbem.com/introduction/) specification.
- Use class instead of style whenever possible to allow users to modify the style.
- We use sass output style, but our variables use native `var()`.
- If it is not necessary, do not create separate variables for the components. We hope that the theme system is simple and easy to use.
- All `font-size` use [RFS](https://github.com/twbs/rfs#readme) to achieve responsive text.

### Other

- Be sure to follow [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.1/), some undefined components, such as `Drawer`, we should also try our best according to the usage Provide WAI-ARIA support.
- Support internationalization.
