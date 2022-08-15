import type { DIconProps } from '../Icon';

import { SettingFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SettingFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
