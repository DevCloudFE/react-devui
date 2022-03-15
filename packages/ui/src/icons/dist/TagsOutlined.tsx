import type { DIconProps } from '../Icon';

import { TagsOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TagsOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
