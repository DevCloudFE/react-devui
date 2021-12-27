import React from 'react';

export interface DFormItemContextData {
  dModel: unknown;
  onModelChange: (value: unknown, name: string) => void;
}
export const DFormItemContext = React.createContext<DFormItemContextData | null>(null);
