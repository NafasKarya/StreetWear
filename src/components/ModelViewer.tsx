'use client';
import React from 'react';

type MVProps = React.HTMLAttributes<HTMLElement> & {
  src?: string;
  alt?: string;
  ar?: boolean;
  'camera-controls'?: boolean;
  'camera-orbit'?: string;
  'auto-rotate'?: boolean;
  rotation?: string;
  exposure?: string;
  'interaction-prompt'?: string;
  'background-color'?: string;
  'disable-zoom'?: boolean;
  'disable-pan'?: boolean;
  [key: string]: any;
};

const ModelViewer: React.FC<MVProps> = (props) => {

  return React.createElement('model-viewer', props);
};

export default ModelViewer;
