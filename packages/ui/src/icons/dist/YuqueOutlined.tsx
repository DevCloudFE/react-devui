import type { DIconProps } from '../Icon';

import { YuqueOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function YuqueOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
