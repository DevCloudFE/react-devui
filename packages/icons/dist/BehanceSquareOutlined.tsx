import type { DIconProps } from '../Icon';

import { BehanceSquareOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function BehanceSquareOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
