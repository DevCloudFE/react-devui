import type { DIconProps } from '../Icon';

import { LoadingOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LoadingOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
