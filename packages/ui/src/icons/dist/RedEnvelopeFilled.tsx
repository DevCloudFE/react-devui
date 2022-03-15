import type { DIconProps } from '../Icon';

import { RedEnvelopeFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RedEnvelopeFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
