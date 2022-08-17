import type { DFormControl } from './FormItem';
import type { FormGroup } from './form-control';

import { useEffect, useMemo, useState } from 'react';

import { useContextOptional } from '../../hooks';
import { DFormContext } from './Form';

export interface DFormInstance {
  form: FormGroup;
  initForm: () => void;
  updateForm: () => void;
}

export function useForm(initData: () => FormGroup): DFormInstance {
  const [form, setForm] = useState(() => initData());
  const [formChange, setFormChange] = useState(0);

  const updateForm = () => {
    setFormChange((n) => n + 1);
  };

  const initForm = () => {
    const data = initData();
    setForm(data);
    updateForm();
  };

  const formInstance = useMemo(
    () => ({
      form,
      initForm,
      updateForm,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formChange]
  );

  return formInstance;
}

export type DFormControlInject = [any, (val: any) => void] | undefined;

export function useFormControl(formControl?: DFormControl): DFormControlInject {
  const { gInstance: formInstance } = useContextOptional(DFormContext);

  const control = formControl?.control;

  useEffect(() => {
    if (control) {
      const ob = control.asyncVerifyComplete$.subscribe({
        next: (val) => {
          if (val.dirty) {
            formInstance?.updateForm();
          }
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [control, formInstance]);

  return control
    ? [
        control.value,
        (val: any) => {
          if (control) {
            control.markAsDirty(true);
            control.setValue(val);
            formInstance?.updateForm();
          }
        },
      ]
    : undefined;
}
