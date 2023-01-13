import { render } from '@testing-library/react';
import React from 'react';

import { DRoot } from '../components/root';

const AllTheProviders: React.JSXElementConstructor<{ children: React.ReactElement }> = ({ children }) => {
  return React.createElement(DRoot, undefined, children);
};

const customRender = ((ui: any, options: any) => render(ui, { wrapper: AllTheProviders, ...options })) as typeof render;

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
