import type { DIconProps } from '../Icon';

import { SkypeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SkypeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
