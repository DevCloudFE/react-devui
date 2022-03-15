import { usePrefixConfig, useTranslation } from '../../hooks';

export interface DDropdownGroupProps {
  id: string;
  children: React.ReactNode;
  dOptions: React.ReactNode;
  dEmpty: boolean;
  dLevel?: number;
}

export function DDropdownGroup(props: DDropdownGroupProps): JSX.Element | null {
  const { id, children, dOptions, dEmpty, dLevel = 0 } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('Common');

  return (
    <ul className={`${dPrefix}dropdown-group`} role="group" aria-labelledby={id}>
      <li id={id} className={`${dPrefix}dropdown-group__label`} style={{ paddingLeft: 12 + dLevel * 16 }} role="presentation">
        {children}
      </li>
      {dEmpty ? (
        <div className={`${dPrefix}dropdown-group__empty`} style={{ paddingLeft: 12 + (dLevel + 1) * 16 }}>
          {t('No Data')}
        </div>
      ) : (
        dOptions
      )}
    </ul>
  );
}
