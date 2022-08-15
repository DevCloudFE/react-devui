import type { DIconProps } from '../Icon';

import { RadiusBottomleftOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RadiusBottomleftOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
