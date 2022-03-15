import type { DIconProps } from '../Icon';

import { CloudDownloadOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CloudDownloadOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
