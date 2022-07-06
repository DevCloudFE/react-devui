import { usePrefixConfig, useTranslation } from '../../hooks';

export interface DDropdownGroupProps {
  children: React.ReactNode;
  dId: string;
  dOptions: React.ReactNode;
  dEmpty: boolean;
  dLevel?: number;
}

export function DDropdownGroup(props: DDropdownGroupProps) {
  const { children, dId, dOptions, dEmpty, dLevel = 0 } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  return (
    <ul className={`${dPrefix}dropdown__group-list`} role="group" aria-labelledby={dId}>
      <li id={dId} className={`${dPrefix}dropdown__group-title`} style={{ paddingLeft: 12 + dLevel * 16 }} role="presentation">
        {children}
      </li>
      {dEmpty ? (
        <div className={`${dPrefix}dropdown__empty`} style={{ paddingLeft: 12 + (dLevel + 1) * 16 }}>
          {t('No Data')}
        </div>
      ) : (
        dOptions
      )}
    </ul>
  );
}
