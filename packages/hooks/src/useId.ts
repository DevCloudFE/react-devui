import { useId as useIdByReact } from 'react';

export function useId(): string {
  return useIdByReact();
}
