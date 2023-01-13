import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

import { DRoot } from '../components/root';

const AllTheProviders: React.JSXElementConstructor<{ children: React.ReactElement }> = ({ children }) => {
  return React.createElement(DRoot, undefined, children);
};

const customRender = ((ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => render(ui, { wrapper: AllTheProviders, ...options }));

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
