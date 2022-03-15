import { usePrefixConfig, useTranslation } from '../../hooks';

export interface DMenuGroupProps {
  id: string;
  children: React.ReactNode;
  dOptions: React.ReactNode;
  dEmpty: boolean;
  dStep: number;
  dSpace: number;
  dLevel?: number;
}

export function DMenuGroup(props: DMenuGroupProps): JSX.Element | null {
  const { id, children, dOptions, dEmpty, dStep, dSpace, dLevel = 0 } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('Common');

  return (
    <ul className={`${dPrefix}menu-group`} role="group" aria-labelledby={id}>
      <li id={id} className={`${dPrefix}menu-group__label`} style={{ paddingLeft: dSpace + dLevel * dStep }} role="presentation">
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
