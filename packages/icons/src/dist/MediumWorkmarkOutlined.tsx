import type { DIconProps } from '../Icon';

import { MediumWorkmarkOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function MediumWorkmarkOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
