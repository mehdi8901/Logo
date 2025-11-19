import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  // Always create a new client to ensure we pick up the latest selected API key
  // if the user changed it via the Veo flow.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateLogoImage = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  
  // Enhancing prompt for logo specific quality
  const enhancedPrompt = `Design a high-quality, professional minimalist vector logo for: ${prompt}. Keep the background neutral or transparent if possible. Clean lines, modern aesthetic.`;

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: enhancedPrompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (!response.generatedImages?.[0]?.image?.imageBytes) {
    throw new Error("Failed to generate image");
  }

  return response.generatedImages[0].image.imageBytes;
};

export const generateVideoFromLogo = async (
  imageBase64: string,
  prompt: string = "Cinematic slow motion reveal of this logo, with subtle lighting effects and 3D rotation."
): Promise<string> => {
  const ai = getAIClient();

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt, 
    image: {
      imageBytes: imageBase64,
      mimeType: 'image/jpeg', // Assuming JPEG from previous step or upload
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9' // Landscape usually looks better for cinematic reveals
    }
  });

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("Video generation completed but no URI returned.");
  }

  // Fetch the actual video blob to display
  const downloadUrl = `${videoUri}&key=${process.env.API_KEY}`;
  const videoResponse = await fetch(downloadUrl);
  
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }

  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

// Helper to check and trigger API key selection
export const checkAndTriggerApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
       try {
         await window.aistudio.openSelectKey();
         // Assume success after closing dialog, or check again if possible
         return true; 
       } catch (e) {
         console.error("Failed to select key", e);
         return false;
       }
    }
    return true;
  }
  // Fallback for dev environments outside of the specific studio context
  // where process.env.API_KEY might already be set manually
  return !!process.env.API_KEY;
};

export const handleApiError = async (error: any, retryAction: () => Promise<void>) => {
  const errorMessage = error?.message || JSON.stringify(error);
  if (errorMessage.includes("Requested entity was not found") && window.aistudio) {
     // Key might be invalid or expired in the session
     await window.aistudio.openSelectKey();
     await retryAction();
  } else {
    throw error;
  }
};