import type { DIconProps } from '../Icon';

import { PropertySafetyOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PropertySafetyOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
