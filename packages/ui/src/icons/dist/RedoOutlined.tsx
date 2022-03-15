import type { DIconProps } from '../Icon';

import { RedoOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RedoOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
