import { useEffect } from 'react';
import { useImmer } from 'use-immer';

let id = 0;
export function getID() {
  return (id += 1);
}

export function useId() {
  const [id, setId] = useImmer(0);

  useEffect(() => {
    setId(getID());
  }, [setId]);

  return id;
}
