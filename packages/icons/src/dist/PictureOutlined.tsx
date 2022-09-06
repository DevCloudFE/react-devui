import type { DIconProps } from '../Icon';

import { PictureOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function PictureOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
