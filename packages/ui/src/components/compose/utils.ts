import { useCustomContext } from '../../hooks';
import { DComposeContext } from './Compose';

export function useCompose() {
  const [{ composeSize, composeDisabled = false }] = useCustomContext(DComposeContext);

  return {
    composeSize,
    composeDisabled,
  };
}
