import type { DIconProps } from '../Icon';

import { FileUnknownFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileUnknownFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
