import type { DIconProps } from '../Icon';

import { UngroupOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UngroupOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
