import { useContext } from 'react';

import { DComposeContext } from '../../components/compose';
import { DFormContext } from '../../components/form';

export function useGeneralContext() {
  const composeContext = useContext(DComposeContext);
  const formContext = useContext(DFormContext);

  return {
    gSize: composeContext?.gSize ?? formContext?.gSize,
    gDisabled: composeContext?.gDisabled,
  };
}
