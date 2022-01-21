/* eslint-disable */
// @ts-nocheck

import { enableMapSet } from 'immer';
enableMapSet();

// https://github.com/immerjs/use-immer
import produce, { nothing, freeze } from "immer";
import { useState, useReducer, useCallback, useMemo, Dispatch } from "react";

export type Reducer<S = any, A = any> = (
  draftState: S,
  action: A
) => void | (S extends undefined ? typeof nothing : S);
export type DraftFunction<S> = (draft: S) => void;
export type Updater<S> = (arg: S | DraftFunction<S>) => void;
export type ImmerHook<S> = [S, Updater<S>];
export function useImmer<S = any>(initialValue: S | (() => S)): ImmerHook<S>;

export function useImmer(initialValue: any) {
  const [val, updateValue] = useState(() =>
    freeze(
      typeof initialValue === "function" ? initialValue() : initialValue,
      true
    )
  );
  return [
    val,
    useCallback((updater) => {
      if (typeof updater === "function") updateValue(produce(updater));
      else updateValue(freeze(updater));
    }, []),
  ];
}

export function useImmerReducer<S = any, A = any>(
  reducer: Reducer<S, A>,
  initialState: S,
  initialAction?: (initial: any) => S
): [S, Dispatch<A>];
export function useImmerReducer(
  reducer: any,
  initialState: any,
  initialAction: any
) {
  const cachedReducer = useMemo(() => produce(reducer), [reducer]);
  return useReducer(cachedReducer, initialState as any, initialAction);
}
