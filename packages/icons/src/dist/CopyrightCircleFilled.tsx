import type { DIconProps } from '../Icon';

import { CopyrightCircleFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CopyrightCircleFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
