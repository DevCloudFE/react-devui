import { usePrefixConfig, useTranslation } from '../root';

export interface DGroupProps {
  children: React.ReactNode;
  dId: string;
  dLevel: number;
  dList: React.ReactNode;
  dEmpty: boolean;
}

export function DGroup(props: DGroupProps): JSX.Element | null {
  const { children, dId, dLevel, dList, dEmpty } = props;

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
        dList
      )}
    </ul>
  );
}
