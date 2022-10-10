import { useMemo } from 'react';

const STR = 'abcdefghijklmnopqrstuvwxyz';

function randomString(length: number) {
  let result = '';
  for (let i = length; i > 0; --i) {
    result += STR[Math.floor(Math.random() * STR.length)];
  }
  return result;
}
const [prefix, suffix] = [randomString(2), randomString(2)];

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

    return `${prefix}${ID.map((charIndex) => STR[charIndex]).join('')}${suffix}`;
  }, []);
}
