import type { DIconProps } from '../Icon';

import { AppstoreAddOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AppstoreAddOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
