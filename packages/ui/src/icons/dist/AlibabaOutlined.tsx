import type { DIconProps } from '../Icon';

import { AlibabaOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AlibabaOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
