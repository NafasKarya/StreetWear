import React from 'react';

// ===== Tambahin ini di bawah import React =====
declare global {
  interface Window {
    snap: any;
  }
}

// ====== (lanjut deklarasi lo yg udah ada) ======
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      'camera-controls'?: boolean;
      'camera-orbit'?: string;
      'auto-rotate'?: boolean;
      rotation?: string;
      style?: React.CSSProperties;
      exposure?: string;
      'interaction-prompt'?: string;
      'background-color'?: string;
      'disable-zoom'?: boolean;
      'disable-pan'?: boolean;
      [key: string]: any;
    };
  }
}
