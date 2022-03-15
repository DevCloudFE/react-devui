import type { DIconProps } from '../Icon';

import { DislikeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function DislikeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
