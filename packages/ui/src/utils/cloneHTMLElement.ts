import React from 'react';

export function cloneHTMLElement<T = React.HTMLAttributes<HTMLElement>>(
  element: React.ReactElement<T>,
  props: T & { ref?: React.ForwardedRef<any> }
) {
  return React.cloneElement(element, props);
}
