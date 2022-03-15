import type { DIconProps } from '../Icon';

import { FieldTimeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FieldTimeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
