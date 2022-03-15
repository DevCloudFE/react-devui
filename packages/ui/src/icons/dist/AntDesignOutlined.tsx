import type { DIconProps } from '../Icon';

import { AntDesignOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AntDesignOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
