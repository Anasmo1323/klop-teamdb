import { useEffect } from "react";

export function useHighlightRow(rows: any[]) {
  useEffect(() => {
    const doHighlight = (id: string) => {
      if (rows.some(r => r.id === id)) {
        setTimeout(() => {
          const el = document.getElementById(`row-${id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.transition = 'background-color 0.5s ease';
            el.style.backgroundColor = 'rgba(234, 179, 8, 0.2)'; // amber 500
            setTimeout(() => {
              el.style.backgroundColor = '';
            }, 2000);
          }
        }, 100);
      }
    };

    // On mount check
    const highlightId = sessionStorage.getItem('highlightRow');
    if (highlightId) {
      doHighlight(highlightId);
      sessionStorage.removeItem('highlightRow');
    }

    // On event check
    const handleHighlightEvent = (e: any) => {
      doHighlight(e.detail);
    };
    window.addEventListener("highlight-row", handleHighlightEvent as EventListener);
    return () => window.removeEventListener("highlight-row", handleHighlightEvent as EventListener);
  }, [rows]);
}
