import type { DIconProps } from '../Icon';

import { FileTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
