import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ComponentRoutes } from './components/routes';

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

      <Route path="*" element={<Navigate to="/components/Button" replace={true} />}></Route>
    </Routes>
  );
}
