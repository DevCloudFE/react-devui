import type { DIconProps } from '../Icon';

import { SnippetsTwoTone as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SnippetsTwoTone(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
