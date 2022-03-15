import type { DIconProps } from '../Icon';

import { LineHeightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function LineHeightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
