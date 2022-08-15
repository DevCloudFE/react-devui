import type { DIconProps } from '../Icon';

import { FundOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FundOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
