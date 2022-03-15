import type { DIconProps } from '../Icon';

import { InsuranceOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InsuranceOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
