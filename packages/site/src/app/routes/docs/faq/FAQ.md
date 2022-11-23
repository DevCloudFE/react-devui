# FAQ

Some frequently asked questions are listed below:

## Does the component library contain side effects?

The component library only covers the global `box-sizing`, which is currently the choice of most people:

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## When components are controlled

We agree that `undefined` represents that the component is in an uncontrolled state, and other values represent that the component is controlled.

## What is the general null value of the controlled component

The null value of the controlled component is generally defined as `null`, please refer to the component API for the actual situation.

## How to modify dayjs configuration

First of all, we should ensure that the project is the only `dayjs` globally, so the `dayjs` of the component library is placed in `peerDependencies`.

You only need to configure `dayjs` in your project, the best practice is to create a `startup` to ensure some configuration at the beginning, please refer to [startup](https://github.com/DevCloudFE/react-devui/tree/main/packages/platform/src/startup).
