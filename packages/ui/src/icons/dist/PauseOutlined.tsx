import type { DIconProps } from '../Icon';

import { PauseOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PauseOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
