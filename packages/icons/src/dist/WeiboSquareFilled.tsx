import type { DIconProps } from '../Icon';

import { WeiboSquareFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WeiboSquareFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
