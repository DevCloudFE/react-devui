import type { DIconProps } from '../Icon';

import { GitlabOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GitlabOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
