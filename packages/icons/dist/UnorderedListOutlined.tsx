import type { DIconProps } from '../Icon';

import { UnorderedListOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function UnorderedListOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
