/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Updater as IUpdater } from './immer';

import { freeze, produce } from 'immer';
import { isArray, isEqual, isFunction, isNull, isUndefined } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DFormContext, DFormGroupContext, DFormItemContext } from '../components/form';
import { useCustomContext } from './context';
import { useIsomorphicLayoutEffect } from './layout-effect';

export type Updater<S> = (value: S) => void;

export function useTwoWayBinding<T, S = T>(
  initialValue: any,
  input?: [any, Updater<any>?],
  onValueChange?: (value: any) => void,
  opt?: {
    id?: string;
    formControlName?: string;
    deepCompare?: boolean;
  }
) {
  if (!isUndefined(input) && !isArray(input)) {
    throw new Error('Please check `input` value');
  }

  const [{ gInstance }] = useCustomContext(DFormContext);
  const [{ gPath }] = useCustomContext(DFormGroupContext);
  const [{ gUpdateFormItems, gRemoveFormItems }] = useCustomContext(DFormItemContext);
  const formControlName = opt?.formControlName;
  const deepCompare = opt?.deepCompare ?? false;

  useIsomorphicLayoutEffect(() => {
    if (formControlName) {
      gUpdateFormItems?.(formControlName, opt?.id);
      return () => {
        gRemoveFormItems?.(formControlName);
      };
    }
  }, [formControlName, gRemoveFormItems, gUpdateFormItems, opt?.id]);

  const formControl = useMemo(() => {
    if (formControlName && gInstance) {
      const control = gInstance.form.get((gPath ?? []).concat([formControlName]));
      if (isNull(control)) {
        throw new Error(`Cant find '${formControlName}', please check if name exists!`);
      }
      return control;
    }

    return null;
  }, [formControlName, gPath, gInstance]);
  useEffect(() => {
    if (formControl) {
      const ob = formControl.asyncVerifyComplete.subscribe({
        next: (control) => {
          if (control.dirty) {
            gInstance?.updateForm();
          }
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [formControl, gInstance]);

  const setValue = input?.[1];
  const [autoValue, setAutoValue] = useState<T>(initialValue);
  const value = isUndefined(input) ? autoValue : input[0];

  const currentValue = formControl ? formControl.value : value;
  const dataRef = useRef({
    preValue: currentValue,
  });
  dataRef.current.preValue = currentValue;

  const changeValue = useCallback(
    (updater: any) => {
      const val = isFunction(updater) ? produce(dataRef.current.preValue, updater) : freeze(updater);
      const shouldUpdate = deepCompare ? !isEqual(dataRef.current.preValue, val) : !Object.is(dataRef.current.preValue, val);
      if (shouldUpdate) {
        if (formControl) {
          formControl.markAsDirty(true);
          formControl.setValue(val);
          onValueChange?.(val);
          gInstance?.updateForm();
        } else {
          setValue?.(val);
          setAutoValue(val);
          onValueChange?.(val);
        }
      }
    },
    [deepCompare, formControl, gInstance, onValueChange, setValue]
  );

  const res = useMemo<
    [
      T,
      IUpdater<S>,
      {
        validateClassName?: string;
        ariaAttribute?: React.HTMLAttributes<HTMLElement>;
        controlDisabled: boolean;
      }
    ]
  >(
    () => [
      currentValue,
      changeValue,
      {
        validateClassName:
          formControl && formControl.dirty
            ? formControl.pending
              ? 'is-pending'
              : formControl.invalid
              ? 'is-invalid'
              : undefined
            : undefined,
        ariaAttribute:
          formControl && formControl.dirty
            ? formControl.invalid
              ? { 'aria-invalid': true, 'aria-describedby': formControl.errors ? formControlName : undefined }
              : { 'aria-invalid': false }
            : undefined,
        controlDisabled: formControl && formControl.disabled ? true : false,
      },
    ],
    [currentValue, changeValue, formControl, formControlName]
  );

  return res;
}
