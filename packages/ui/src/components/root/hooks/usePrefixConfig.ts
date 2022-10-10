import { useContextRequired } from '../../../hooks';
import { DConfigContext } from '../contex';

export function usePrefixConfig() {
  const namespace = useContextRequired(DConfigContext).namespace;

  return `${namespace}-`;
}
