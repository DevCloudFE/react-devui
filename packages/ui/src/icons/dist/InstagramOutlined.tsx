import type { DIconProps } from '../Icon';

import { InstagramOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InstagramOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
