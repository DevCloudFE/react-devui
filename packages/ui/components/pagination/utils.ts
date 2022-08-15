export function getButtonRoleAttributes(handleClick: () => void, disabled = false) {
  return {
    tabIndex: disabled ? -1 : 0,
    role: 'button',
    'aria-disabled': disabled,
    onKeyDown: (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();

        handleClick();
      }
    },
    onClick: handleClick,
  } as React.HTMLAttributes<HTMLElement>;
}
