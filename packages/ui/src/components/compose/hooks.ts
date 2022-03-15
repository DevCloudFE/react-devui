export function useCompose(active?: boolean, disabled?: boolean) {
  const data = {
    'data-compose-support': true,
  };

  if (active) {
    data['data-compose-support-active'] = true;
  }

  if (disabled) {
    data['data-compose-support-disabled'] = true;
  }

  return data;
}
