import type { DIconProps } from '../Icon';

import { SafetyCertificateFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SafetyCertificateFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
