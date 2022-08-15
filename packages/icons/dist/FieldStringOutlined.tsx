import type { DIconProps } from '../Icon';

import { FieldStringOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FieldStringOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
