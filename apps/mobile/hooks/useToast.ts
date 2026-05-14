import { useState, useCallback, useRef } from "react";

interface ToastState {
  message: string;
  visible: boolean;
  type: "success" | "error" | "info";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    visible: false,
    type: "success",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (
      message: string,
      type: ToastState["type"] = "success",
      duration = 2500,
    ) => {
      // Clear any existing timer before showing a new one
      if (timerRef.current) clearTimeout(timerRef.current);

      setToast({ message, visible: true, type });
      timerRef.current = setTimeout(
        () => setToast((prev) => ({ ...prev, visible: false })),
        duration,
      );
    },
    [],
  );

  return { toast, show };
}
