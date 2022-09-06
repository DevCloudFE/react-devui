import type { DIconProps } from '../Icon';

import { ApiOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ApiOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
