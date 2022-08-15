import type { DIconProps } from '../Icon';

import { GifOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GifOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
