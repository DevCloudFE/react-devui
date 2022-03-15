import { usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DLinkProps {
  children: React.ReactNode;
  dHref: string;
  dActive: boolean;
  dTarget?: string;
  dLevel?: number;
  onClick: () => void;
}

export function DLink(props: DLinkProps) {
  const { children, dHref, dActive, dTarget, dLevel = 0, onClick } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <li>
      <a
        className={getClassName(`${dPrefix}anchor-link`, {
          'is-active': dActive,
        })}
        style={{ paddingLeft: 16 + dLevel * 16 }}
        href={dHref}
        target={dTarget}
        onClick={(e) => {
          e.preventDefault();

          onClick();
        }}
      >
        {children}
      </a>
    </li>
  );
}
