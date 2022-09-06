import type { DIconProps } from '../Icon';

import { CaretUpOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CaretUpOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
