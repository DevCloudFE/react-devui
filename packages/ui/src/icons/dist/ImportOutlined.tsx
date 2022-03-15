import type { DIconProps } from '../Icon';

import { ImportOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ImportOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
