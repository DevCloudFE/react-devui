import type { DIconProps } from '../Icon';

import { SendOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SendOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
