import type { DIconProps } from '../Icon';

import { SnippetsOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SnippetsOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
