import type { DIconProps } from '../Icon';

import { IdcardTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function IdcardTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
