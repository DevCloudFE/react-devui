import type { FormGroup } from './form';

import { useMemo, useState } from 'react';

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
