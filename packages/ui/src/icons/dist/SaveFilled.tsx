import type { DIconProps } from '../Icon';

import { SaveFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SaveFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
