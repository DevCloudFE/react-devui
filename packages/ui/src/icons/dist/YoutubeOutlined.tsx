import type { DIconProps } from '../Icon';

import { YoutubeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function YoutubeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
