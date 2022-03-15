import type { DIconProps } from '../Icon';

import { CrownOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CrownOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
