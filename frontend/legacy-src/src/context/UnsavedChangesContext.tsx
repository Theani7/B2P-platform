import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UnsavedChangesContextType {
  isDirty: boolean;
  markDirty: () => void;
  markClean: () => void;
  reset: () => void;
  shouldBlockNavigation: () => boolean;
  handleNavigation: (to: string) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export const UnsavedChangesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const markDirty = useCallback(() => setIsDirty(true), []);
  const markClean = useCallback(() => setIsDirty(false), []);
  const reset = useCallback(() => {
    setIsDirty(false);
    setPendingPath(null);
    setShowDialog(false);
  }, []);

  const shouldBlockNavigation = useCallback(() => isDirty, [isDirty]);

  const handleNavigation = useCallback((to: string) => {
    if (isDirty) {
      setPendingPath(to);
      setShowDialog(true);
    } else {
      navigate(to);
    }
  }, [isDirty, navigate]);

  const confirmNavigation = useCallback(() => {
    if (pendingPath) {
      setIsDirty(false);
      navigate(pendingPath);
      reset();
    }
  }, [pendingPath, navigate, reset]);

  const cancelNavigation = useCallback(() => {
    setPendingPath(null);
    setShowDialog(false);
  }, []);

  // Intercept beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Intercept global link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href && link.target !== '_blank' && link.origin === window.location.origin) {
        const path = link.pathname + link.search + link.hash;
        if (isDirtyRef.current && path !== location.pathname) {
          e.preventDefault();
          handleNavigation(path);
        }
      }
    };
    
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [location.pathname, handleNavigation]);

  return (
    <UnsavedChangesContext.Provider value={{ isDirty, markDirty, markClean, reset, shouldBlockNavigation, handleNavigation }}>
      {children}
      {showDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden" role="dialog" aria-modal="true">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Unsaved Changes</h3>
              <p className="text-sm text-gray-600">
                You have unsaved changes. If you leave now, your changes will be lost.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={cancelNavigation}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Stay
              </button>
              <button 
                onClick={confirmNavigation}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </UnsavedChangesContext.Provider>
  );
};

export const useUnsavedChangesContext = () => {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChangesContext must be used within an UnsavedChangesProvider');
  }
  return context;
};
