import type { DIconProps } from '../Icon';

import { FrownOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FrownOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
