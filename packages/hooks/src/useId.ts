import { useMemo } from 'react';

const STR = 'abcdefghijklmnopqrstuvwxyz';

const ID = [-1];
export function useId(): string {
  return useMemo(() => {
    const reduce = (index: number) => {
      const charIndex = ID[index] ?? -1;
      if (charIndex + 1 === STR.length) {
        ID[index] = 0;
        reduce(index + 1);
      } else {
        ID[index] = charIndex + 1;
      }
    };
    reduce(0);

    return `${useId.PREFIX}${ID.map((charIndex) => STR[charIndex]).join('')}`;
  }, []);
}
useId.PREFIX = 'ID';
