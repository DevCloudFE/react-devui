import type { DIconProps } from '../Icon';

import { FileUnknownTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileUnknownTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
