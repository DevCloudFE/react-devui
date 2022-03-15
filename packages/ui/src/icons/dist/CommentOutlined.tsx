import type { DIconProps } from '../Icon';

import { CommentOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CommentOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
