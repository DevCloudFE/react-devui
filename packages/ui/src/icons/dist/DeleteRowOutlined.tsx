import type { DIconProps } from '../Icon';

import { DeleteRowOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DeleteRowOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
