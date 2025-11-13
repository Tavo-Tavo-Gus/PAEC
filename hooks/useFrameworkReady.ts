import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
    isFrameworkReady: boolean;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    window.frameworkReady?.();
    window.isFrameworkReady = true;
  });
}