import type { DIconProps } from '../Icon';

import { CaretLeftOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CaretLeftOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
