import type { DIconProps } from '../Icon';

import { TranslationOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TranslationOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
