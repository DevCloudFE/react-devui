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

For non-new component contributions, please refer to [Contribution Guide](CONTRIBUTING.md).

## Directory Structure

```
├── packages                                    // Root Directory: Project
│   │
│   │
│   ├── site                                    // Root Directory: Website
│   │   └── src
│   │       ├── app
│   │       │   ├── components                  // Components
│   │       │   ├── configs                     // Configuration files (json)
│   │       │   ├── i18n                        // Internationalization
│   │       │   ├── routes                      // Routes
│   │       │   └── styles                      // Styles
│   │       ├── assets                          // Static resources
│   │       └── environments                    // Configuration files in development and production environments
│   │
│   │
│   └── ui                                      // Root Directory: Components
│       └── src
│           ├── components                      // Components
│           ├── hooks                           // Hooks
│           ├── styles                          // Styles
│           ├── tests                           // Test configuration
│           └── utils                           // Utility function
│
│
└── tools                                       // Root Directory: Project Cli
```

## VSCode configuration

Refer to [README.md](https://github.com/xiejay97/react-devui/tree/main/.vscode) under the `.vscode` directory

## Design guide

- Use Hooks to complete the components.
- Keep the independence of components to the greatest extent possible, and use component combinations to complete more complex logic, for example: [Drawer](https://github.com/xiejay97/react-devui/tree/main/packages/ui/src/components/drawer) component separates the Header, so that we can use the DrawerHeader alone instead of passing the header's Props to the Drawer component. More than that, the separation of the components saves us from worrying about future component functions becoming more and more difficult to maintain.
- Ensure that the component `Props` inherits native attributes, such as `React.HTMLAttributes<HTMLElement>`. We hope that the use of the component is consistent with the DOM element. When implementing the component, we need to be careful not to overwrite the `id` and `className` passed by the user , `style` and events (such as onClick).
- Ensure that only the `Props` of the root component of the complex component provides callbacks, such as only [DMenu](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/menu/Menu.tsx) provides the `onActiveChange` callback.
- Support two-way binding ([useTwoWayBinding](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/hooks/two-way-binding.ts)), refer to [DRadio](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/radio/Radio.tsx).
- Data entry must be implemented using native `input`, and use [useTwoWayBinding](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/hooks/two-way-binding.ts) to support future `form` components, refer to [DRadio](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/radio/Radio.tsx).
- Use `useAsync` to manage asynchronous functions. By intercepting asynchronous methods, such as `setTimeout`, we ensure that asynchronous functions will not be executed after the component is destroyed.
- Be sure to follow [WAI-ARIA](https://www.w3.org/TR/wai-aria-practices-1.2/), some undefined components, such as `Drawer`, we should also try our best according to the usage Provide WAI-ARIA support.
- Support internationalization, refer to [DFooter](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/_footer/Footer.tsx).
- Don't introduce third-party components, we want components to be completely controllable.
- Use class instead of style whenever possible to allow users to modify the style.

## Style

- The class naming follows the [BEM](http://getbem.com/introduction/) specification.
- [Mixin](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/styles/mixins/_bem.scss) that provides additional themes, status, js, refer to [namespaces ](https://csswizardry.com/2015/03/more-transparent-ui-code-with-namespaces/).
- All `font-size` use [RFS](https://github.com/twbs/rfs#readme) to achieve responsive text.
- We use the sass output style, but our variables use the native `var()`.

## Test

- Don't use snapshots (I have good reasons to convince you why not use it).
- The test should focus on the completeness of the function, that is, whether the input Props can get the response we expect.
- If the non-Props changes of the component will affect the test, such as the style of the component (adjust the position of the icon), the text content of the component (when testing the button in the component, text is often used to determine whether the button is the expected button), then you should doubt whether the test is Reasonable. Refer to [DFooter](https://github.com/xiejay97/react-devui/blob/main/packages/ui/src/components/_footer/Footer.tsx).
