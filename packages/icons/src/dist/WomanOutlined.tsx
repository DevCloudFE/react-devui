import type { DIconProps } from '../Icon';

import { WomanOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WomanOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
