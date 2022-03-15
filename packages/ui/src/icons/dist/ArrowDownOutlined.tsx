import type { DIconProps } from '../Icon';

import { ArrowDownOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ArrowDownOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
