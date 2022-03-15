import type { DIconProps } from '../Icon';

import { SafetyCertificateOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SafetyCertificateOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
