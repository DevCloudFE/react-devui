import type { DIconProps } from '../Icon';

import { CopyrightCircleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CopyrightCircleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
