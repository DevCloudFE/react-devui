import type { DIconProps } from '../Icon';

import { FundViewOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FundViewOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
