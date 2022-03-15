import type { DIconProps } from '../Icon';

import { VerticalLeftOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VerticalLeftOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
