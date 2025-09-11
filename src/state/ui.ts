import { useCallback, useEffect, useRef, useState } from "react";

export type ToastState = { message: string; variant: "success" | "error" } | null;

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    setToast({ message, variant });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    }
  }, []);

  return { toast, showToast } as const;
}


