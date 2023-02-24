/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { useLocation } from 'react-router-dom';

export function AppRoute(FC: React.FC) {
  return (props: { aReloadWhenPathChange?: boolean }) => {
    const { aReloadWhenPathChange = true } = props;

    const location = useLocation();

    return React.createElement(FC, aReloadWhenPathChange ? { key: location.pathname } : undefined);
  };
}
