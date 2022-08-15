import type { DIconProps } from '../Icon';

import { FileGifOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FileGifOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
