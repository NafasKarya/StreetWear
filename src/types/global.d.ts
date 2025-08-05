// src/types/global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      alt?: string;
      cameraControls?: boolean;
      cameraOrbit?: string;
      autoRotate?: boolean;
      rotation?: string;
      exposure?: string;
      interactionPrompt?: string;
      backgroundColor?: string;
      disableZoom?: boolean;
      disablePan?: boolean;
      [key: string]: any;
    };
  }
}
