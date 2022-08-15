import type { DIconProps } from '../Icon';

import { SettingOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SettingOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
