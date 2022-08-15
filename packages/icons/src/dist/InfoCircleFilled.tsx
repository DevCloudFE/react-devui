import type { DIconProps } from '../Icon';

import { InfoCircleFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InfoCircleFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
