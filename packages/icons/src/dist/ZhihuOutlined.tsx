import type { DIconProps } from '../Icon';

import { ZhihuOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ZhihuOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
