import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ComponentRoutes } from './components/routes';
const ComponentInterfaceRoute = lazy(() => import('./components/Interface/Interface'));

export function AppRoutes() {
  return (
    <Routes>
      {ComponentRoutes.map(({ path, component }) => (
        <Route
          key={path}
          path={path}
          element={<Suspense fallback={<div className="app-top-line-loader" />}>{React.createElement(component)}</Suspense>}
        />
      ))}

      <Route
        path="/components/Interface"
        element={<Suspense fallback={<div className="app-top-line-loader" />}>{React.createElement(ComponentInterfaceRoute)}</Suspense>}
      />

      <Route path="*" element={<Navigate to="/components/Button" replace={true} />}></Route>
    </Routes>
  );
}
