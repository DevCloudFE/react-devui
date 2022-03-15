import type { DIconProps } from '../Icon';

import { ArrowsAltOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ArrowsAltOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
