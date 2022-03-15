import type { DIconProps } from '../Icon';

import { FileProtectOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileProtectOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
