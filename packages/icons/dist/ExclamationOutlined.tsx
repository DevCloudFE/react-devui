import type { DIconProps } from '../Icon';

import { ExclamationOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ExclamationOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
