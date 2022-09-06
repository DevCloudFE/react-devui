import { usePrefixConfig, useTranslation } from '../../hooks';

export interface DGroupProps {
  children: React.ReactNode;
  dId: string;
  dList: React.ReactNode;
  dEmpty: boolean;
  dStep: number;
  dSpace: number;
  dLevel?: number;
}

export function DGroup(props: DGroupProps): JSX.Element | null {
  const { children, dId, dList, dEmpty, dStep, dSpace, dLevel = 0 } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  return (
    <ul className={`${dPrefix}menu__group-list`} role="group" aria-labelledby={dId}>
      <li id={dId} className={`${dPrefix}menu__group-title`} style={{ paddingLeft: dSpace + dLevel * dStep }} role="presentation">
        {children}
      </li>
      {dEmpty ? (
        <div className={`${dPrefix}menu__empty`} style={{ paddingLeft: dSpace + (dLevel + 1) * dStep }}>
          {t('No Data')}
        </div>
      ) : (
        dList
      )}
    </ul>
  );
}
