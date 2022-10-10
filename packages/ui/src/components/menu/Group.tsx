import { usePrefixConfig, useTranslation } from '../root';

export interface DGroupProps {
  children: React.ReactNode;
  dId: string;
  dLevel: number;
  dStep: number;
  dSpace: number;
  dList: React.ReactNode;
  dEmpty: boolean;
}

export function DGroup(props: DGroupProps): JSX.Element | null {
  const { children, dLevel, dStep, dSpace, dId, dList, dEmpty } = props;

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
