import type { DIconProps } from '../Icon';

import { FieldNumberOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FieldNumberOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
