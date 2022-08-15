import type { DIconProps } from '../Icon';

import { BorderRightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BorderRightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
