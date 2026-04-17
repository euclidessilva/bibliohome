import { useEffect, useCallback, useRef } from 'react';

/**
 * Global HID barcode scanner listener.
 * Barcode scanners simulate rapid keystrokes followed by Enter.
 * Accumulates chars in a buffer and fires onScan when Enter is pressed
 * or after a timeout — but only when no input/textarea is focused.
 */
export function useISBNScanner(onScan, enabled = true) {
  const bufferRef = useRef('');
  const timerRef = useRef(null);

  const isISBN = (str) => {
    const clean = str.replace(/[-\s]/g, '');
    return /^\d{10}(\d{3})?$/.test(clean);
  };

  const flush = useCallback(() => {
    const value = bufferRef.current.trim();
    bufferRef.current = '';
    if (value && isISBN(value)) {
      onScan(value.replace(/[-\s]/g, ''));
    }
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ignore if focus is on an input or textarea
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(timerRef.current);
        flush();
        return;
      }

      // Only accumulate printable chars
      if (e.key.length === 1) {
        bufferRef.current += e.key;

        // Reset timeout — scanners type fast, so short timeout
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          flush();
        }, 80);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, [enabled, flush]);
}
