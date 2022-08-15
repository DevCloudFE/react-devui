import type { DIconProps } from '../Icon';

import { DeleteColumnOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DeleteColumnOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
