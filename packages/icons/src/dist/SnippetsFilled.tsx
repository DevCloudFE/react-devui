import type { DIconProps } from '../Icon';

import { SnippetsFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SnippetsFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
