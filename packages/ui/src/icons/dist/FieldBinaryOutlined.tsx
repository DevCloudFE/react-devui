import type { DIconProps } from '../Icon';

import { FieldBinaryOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FieldBinaryOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
