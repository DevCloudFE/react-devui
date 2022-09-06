import type { DIconProps } from '../Icon';

import { AppstoreOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AppstoreOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
