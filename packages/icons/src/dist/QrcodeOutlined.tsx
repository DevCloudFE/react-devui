import type { DIconProps } from '../Icon';

import { QrcodeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function QrcodeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
