import type { DIconProps } from '../Icon';

import { PicLeftOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PicLeftOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
