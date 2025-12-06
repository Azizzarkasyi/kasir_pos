import { useCallback, useEffect, useState } from "react";

type Listener = (id: string | null) => void;

const listeners = new Set<Listener>();
let currentOpenId: string | null = null;

const notify = (id: string | null) => {
  currentOpenId = id;
  listeners.forEach(listener => listener(id));
};

export const useDropdown = (initialOpen: boolean = false, id?: string) => {
  const [open, setOpen] = useState<boolean>(initialOpen);

  useEffect(() => {
    if (!id) return;

    const handleChange: Listener = newId => {
      if (newId !== id && newId !== null) {
        setOpen(false);
      }
    };

    listeners.add(handleChange);

    return () => {
      listeners.delete(handleChange);
    };
  }, [id]);

  const openDropdown = useCallback(() => {
    setOpen(true);
    if (id) {
      notify(id);
    }
  }, [id]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    if (id && currentOpenId === id) {
      notify(null);
    }
  }, [id]);

  const toggleDropdown = useCallback(() => {
    setOpen(prev => {
      const next = !prev;
      if (id) {
        notify(next ? id : null);
      }
      return next;
    });
  }, [id]);

  return {
    open,
    setOpen,
    openDropdown,
    closeDropdown,
    toggleDropdown,
  };
};
