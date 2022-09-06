import type { DIconProps } from '../Icon';

import { GlobalOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GlobalOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
