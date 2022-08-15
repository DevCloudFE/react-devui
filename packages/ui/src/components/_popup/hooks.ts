import { useCallback } from 'react';

import { useImmer } from '@react-devui/hooks';

export function useNestedPopup<ID>(initialValue: ID[] = []) {
  const [popupIds, setPopupIds] = useImmer<{ id: ID; visible: boolean }[]>(() => initialValue.map((id) => ({ id, visible: true })));

  const addPopupId = useCallback(
    (id: ID) => {
      setPopupIds((draft) => {
        if (draft.findIndex((v) => v.id === id) === -1) {
          draft.push({ id, visible: true });
        }
      });
    },
    [setPopupIds]
  );

  const removePopupId = useCallback(
    (id: ID) => {
      setPopupIds((draft) => {
        const index = draft.findIndex((v) => v.id === id);
        if (index !== -1) {
          draft[index].visible = false;
          for (let index = draft.length - 1; index >= 0; index--) {
            if (draft[index].visible) {
              break;
            }
            draft.pop();
          }
        }
      });
    },
    [setPopupIds]
  );

  return { popupIds, setPopupIds, addPopupId, removePopupId };
}
