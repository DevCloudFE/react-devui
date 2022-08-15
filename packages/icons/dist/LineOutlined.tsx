import type { DIconProps } from '../Icon';

import { LineOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LineOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
