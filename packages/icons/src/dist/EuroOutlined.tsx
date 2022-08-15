import type { DIconProps } from '../Icon';

import { EuroOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function EuroOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
