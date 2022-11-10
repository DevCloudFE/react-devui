import { enableMapSet, freeze, produce } from 'immer';
import { useState, useCallback } from 'react';

enableMapSet();

export type DraftFunction<S> = (draft: S) => void;
export type Updater<S> = (arg: S | DraftFunction<S>) => void;
export type ImmerHook<S> = [S, Updater<S>];

export function useImmer<S>(): ImmerHook<S | undefined>;
export function useImmer<S = any>(initialValue: S | (() => S)): ImmerHook<S>;
export function useImmer(initialValue?: any) {
  const [val, updateValue] = useState(() => freeze(typeof initialValue === 'function' ? initialValue() : initialValue, true));
  const setValue = useCallback((updater: any) => {
    if (typeof updater === 'function') updateValue(produce(updater));
    else updateValue(freeze(updater));
  }, []);
  return [val, setValue];
}
