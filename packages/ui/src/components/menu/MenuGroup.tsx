import { usePrefixConfig, useTranslation } from '../../hooks';

export interface DMenuGroupProps {
  children: React.ReactNode;
  dId: string;
  dOptions: React.ReactNode;
  dEmpty: boolean;
  dStep: number;
  dSpace: number;
  dLevel?: number;
}

export function DMenuGroup(props: DMenuGroupProps): JSX.Element | null {
  const { children, dId, dOptions, dEmpty, dStep, dSpace, dLevel = 0 } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('Common');

  return (
    <ul className={`${dPrefix}menu-group`} role="group" aria-labelledby={dId}>
      <li id={dId} className={`${dPrefix}menu-group__label`} style={{ paddingLeft: dSpace + dLevel * dStep }} role="presentation">
        {children}
      </li>
      {dEmpty ? (
        <div className={`${dPrefix}menu-group__empty`} style={{ paddingLeft: dSpace + (dLevel + 1) * dStep }}>
          {t('No Data')}
        </div>
      ) : (
        dOptions
      )}
    </ul>
  );
}
