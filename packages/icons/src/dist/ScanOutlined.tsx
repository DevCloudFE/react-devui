import type { DIconProps } from '../Icon';

import { ScanOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ScanOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
