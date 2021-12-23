import type { FormGroup } from './form';

import { useCallback, useMemo, useState } from 'react';

export interface DFormInstance {
  form: FormGroup;
  resetForm: () => void;
  updateForm: () => void;
}

export function useForm(initData: () => FormGroup): DFormInstance {
  const [form, setForm] = useState(initData);
  const [formChange, setFormChange] = useState(0);

  const updateForm = useCallback(() => {
    setFormChange((n) => n + 1);
  }, []);

  const resetForm = useCallback(() => {
    const data = initData();
    setForm(data);
  }, [initData]);

  const formInstance = useMemo(
    () => ({
      form,
      resetForm,
      updateForm,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formChange]
  );

  return formInstance;
}
