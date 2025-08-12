import { useCallback, useState } from 'react';

export const useSidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return {
    isSidebarOpen,
    openSidebar,
    closeSidebar,
  };
};
