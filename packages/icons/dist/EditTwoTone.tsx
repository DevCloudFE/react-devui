import type { DIconProps } from '../Icon';

import { EditTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EditTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
