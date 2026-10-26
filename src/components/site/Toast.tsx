"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Toast simples no estilo do site original. Use: const { toast, show } = useToast(). */
export function useToast() {
  const [message, setMessage] = useState<{ icon: string; text: string; id: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((icon: string, text: string) => {
    clearTimeout(timer.current);
    setMessage({ icon, text, id: Date.now() });
    timer.current = setTimeout(() => setMessage(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const toast = message ? (
    <div key={message.id} className="toast-lacid" role="status">
      <i className={`bi ${message.icon}`} />
      {message.text}
    </div>
  ) : null;

  return { toast, show };
}
