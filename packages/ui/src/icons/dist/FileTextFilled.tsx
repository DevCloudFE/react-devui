import type { DIconProps } from '../Icon';

import { FileTextFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileTextFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
