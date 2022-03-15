import type { DIconProps } from '../Icon';

import { CodeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CodeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
