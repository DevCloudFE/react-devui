import type { DIconProps } from '../Icon';

import { RadiusSettingOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RadiusSettingOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
