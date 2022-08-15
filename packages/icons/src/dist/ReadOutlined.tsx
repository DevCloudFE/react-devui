import type { DIconProps } from '../Icon';

import { ReadOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ReadOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
