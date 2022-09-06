import type { DIconProps } from '../Icon';

import { FileAddFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileAddFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
