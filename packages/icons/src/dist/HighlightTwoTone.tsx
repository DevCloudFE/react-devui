import type { DIconProps } from '../Icon';

import { HighlightTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function HighlightTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
