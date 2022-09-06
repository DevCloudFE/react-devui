import type { DIconProps } from '../Icon';

import { MinusOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MinusOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
