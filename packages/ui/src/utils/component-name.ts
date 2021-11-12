export function getComponentName(reactElement: React.ReactElement) {
  return (reactElement.type as React.JSXElementConstructor<unknown>).name;
}
