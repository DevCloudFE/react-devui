import type { DIconProps } from '../Icon';

import { EditFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EditFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
