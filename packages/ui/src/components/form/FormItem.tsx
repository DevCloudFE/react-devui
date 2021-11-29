import React from 'react';

export interface DFormItemContextData {
  value: unknown;
  onValueChange: (value: unknown, name: string) => void;
}
export const DFormItemContext = React.createContext<DFormItemContextData | null>(null);
