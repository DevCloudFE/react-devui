import type { DIconProps } from '../Icon';

import { RestTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RestTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
