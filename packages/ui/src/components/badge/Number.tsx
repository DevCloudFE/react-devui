import { useEffect, useRef, useState } from 'react';

import { usePrefixConfig } from '../root';

export interface DNumberProps {
  dValue: number;
  dDown: boolean;
}

export function DNumber(props: DNumberProps): JSX.Element | null {
  const { dValue, dDown } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const containerRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    prevValue: number;
  }>({
    prevValue: dValue,
  });

  const [nums, setNums] = useState<number[]>([dValue]);

  useEffect(() => {
    if (containerRef.current && dataRef.current.prevValue !== dValue) {
      let newNums: number[] = Array(10)
        .fill(0)
        .map((n, i) => i);
      if (dDown) {
        newNums = newNums.concat(
          Array(dataRef.current.prevValue + 1)
            .fill(0)
            .map((n, i) => i)
        );
        newNums = newNums.slice(newNums.length - 10, newNums.length);
        containerRef.current.style.cssText = 'transform:translateY(-900%);transition:none;';
      } else {
        newNums = Array(10 - dataRef.current.prevValue)
          .fill(0)
          .map((n, i) => dataRef.current.prevValue + i)
          .concat(newNums);
        newNums = newNums.slice(0, 10);
        containerRef.current.style.cssText = 'transform:translateY(0);transition:none;';
      }
      dataRef.current.prevValue = dValue;
      setNums(newNums);
    }
  }, [dDown, dValue]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cssText = `transform:translateY(-${nums.findIndex((n) => n === dValue) * 100}%); `;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nums]);

  return (
    <div ref={containerRef} className={`${dPrefix}badge__number-container`}>
      {nums.map((n, i) => (
        <span key={i} className={`${dPrefix}badge__number`}>
          {n}
        </span>
      ))}
    </div>
  );
}
