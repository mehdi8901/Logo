export enum AppState {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  IMAGE_READY = 'IMAGE_READY',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  VIDEO_READY = 'VIDEO_READY',
  ERROR = 'ERROR'
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export interface GeneratedVideo {
  url: string;
}

// Extend Window interface for AI Studio specific properties
declare global {
  // We augment the existing AIStudio interface (inferred from errors) to ensure it has the methods we need.
  // We do NOT redeclare 'aistudio' on Window as it conflicts with the existing environment definition.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}