import type { DIconProps } from '../Icon';

import { ZhihuSquareFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ZhihuSquareFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
