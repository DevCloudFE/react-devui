import type { DIconProps } from '../Icon';

import { VerticalRightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function VerticalRightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
