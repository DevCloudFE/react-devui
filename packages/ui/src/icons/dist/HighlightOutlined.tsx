import type { DIconProps } from '../Icon';

import { HighlightOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HighlightOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
