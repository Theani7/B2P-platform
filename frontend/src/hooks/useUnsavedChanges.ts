import { useEffect } from 'react';
import { useUnsavedChangesContext } from '../context/UnsavedChangesContext';
import { UseFormReturn } from 'react-hook-form';

export function useUnsavedChanges(isDirtyParam?: boolean | UseFormReturn<any>) {
  const { markDirty, markClean, reset, isDirty } = useUnsavedChangesContext();

  useEffect(() => {
    let dirty = false;
    
    // Check if it's a React Hook Form instance
    if (isDirtyParam && typeof isDirtyParam === 'object' && 'formState' in isDirtyParam) {
      dirty = isDirtyParam.formState.isDirty;
    } else if (typeof isDirtyParam === 'boolean') {
      dirty = isDirtyParam;
    }

    if (dirty) {
      markDirty();
    } else {
      markClean();
    }

    // Always clean up when component unmounts
    return () => {
      markClean();
    };
  }, [isDirtyParam, markDirty, markClean]);

  return { isDirty, markDirty, markClean, reset };
}
