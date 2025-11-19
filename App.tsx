import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Film, AlertCircle } from 'lucide-react';
import { AppState, GeneratedImage, GeneratedVideo } from './types';
import { generateLogoImage, generateVideoFromLogo, checkAndTriggerApiKey, handleApiError } from './services/geminiService';
import { LogoGenerator } from './components/LogoGenerator';
import { VideoAnimator } from './components/VideoAnimator';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Button } from './components/Button';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [video, setVideo] = useState<GeneratedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    // Initial check for API key availability if needed
    const init = async () => {
      const hasKey = await checkAndTriggerApiKey();
      if (!hasKey) {
        // Ideally we don't block immediately, but let them try an action
      }
    };
    init();
  }, []);

  const ensureApiKey = async (): Promise<boolean> => {
    const hasKey = await checkAndTriggerApiKey();
    if (!hasKey) {
      setShowApiKeyModal(true);
      return false;
    }
    return true;
  };

  const handleGenerateLogo = async (prompt: string) => {
    setError(null);
    if (!(await ensureApiKey())) return;

    setAppState(AppState.GENERATING_IMAGE);
    
    try {
      const runGeneration = async () => {
        const base64 = await generateLogoImage(prompt);
        setImage({ base64, mimeType: 'image/jpeg' });
        setAppState(AppState.IMAGE_READY);
        setVideo(null); // Reset video if new image
      };

      await runGeneration().catch(err => handleApiError(err, runGeneration));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate logo. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleImageReady = (newImage: GeneratedImage) => {
    setImage(newImage);
    setAppState(AppState.IMAGE_READY);
    setVideo(null);
    setError(null);
  };

  const handleAnimateLogo = async (prompt: string) => {
    if (!image) return;
    setError(null);
    if (!(await ensureApiKey())) return;

    setAppState(AppState.GENERATING_VIDEO);

    try {
       const runAnimation = async () => {
         const videoUrl = await generateVideoFromLogo(image.base64, prompt);
         setVideo({ url: videoUrl });
         setAppState(AppState.VIDEO_READY);
       };

       await runAnimation().catch(err => handleApiError(err, runAnimation));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to animate logo. Note: Video generation takes time.");
      setAppState(AppState.IMAGE_READY); // Go back to image ready state
    }
  };

  const handleKeySelect = async () => {
    try {
      await window.aistudio.openSelectKey();
      setShowApiKeyModal(false);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {showApiKeyModal && <ApiKeyModal onSelectKey={handleKeySelect} />}

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              LogoMotion AI
            </h1>
          </div>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Powered by Gemini & Veo
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Controls */}
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-3xl font-bold">Create & Animate</h2>
              <p className="text-zinc-400">
                Generate a professional vector-style logo from a text description, or upload your own. Then, use Veo's generative video capabilities to bring it to life.
              </p>
            </div>

            <LogoGenerator 
              onGenerate={handleGenerateLogo} 
              isGenerating={appState === AppState.GENERATING_IMAGE}
              onImageReady={handleImageReady}
            />

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
            
            {/* Animation Controls (Only visible when image exists) */}
            {(appState === AppState.IMAGE_READY || appState === AppState.GENERATING_VIDEO || appState === AppState.VIDEO_READY) && (
               <VideoAnimator 
                 onAnimate={handleAnimateLogo}
                 isAnimating={appState === AppState.GENERATING_VIDEO}
               />
            )}
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden min-h-[500px] flex flex-col relative shadow-2xl">
              
              {/* Image Preview */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 border-b border-zinc-800/50">
                {image ? (
                  <div className="relative group">
                    <img 
                      src={`data:${image.mimeType};base64,${image.base64}`} 
                      alt="Generated Logo" 
                      className="max-h-64 w-auto rounded-lg shadow-2xl shadow-indigo-500/10 ring-1 ring-white/10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">Source Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-zinc-500">
                    <div className="bg-zinc-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                    </div>
                    <p>No image selected</p>
                    <p className="text-sm opacity-60">Generate or upload a logo to start</p>
                  </div>
                )}
              </div>

              {/* Video Preview */}
              <div className="flex-1 bg-zinc-950/50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {video ? (
                  <div className="w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
                    <video 
                      src={video.url} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full object-cover"
                    />
                     <div className="absolute top-2 right-2 bg-indigo-600/90 px-2 py-1 rounded text-[10px] font-bold tracking-wider text-white uppercase">
                      Veo Generated
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-zinc-500">
                    {appState === AppState.GENERATING_VIDEO ? (
                       <div className="flex flex-col items-center animate-pulse">
                         <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                         <p className="text-indigo-400 font-medium">Veo is dreaming...</p>
                         <p className="text-xs mt-1 text-zinc-500">This may take a minute</p>
                       </div>
                    ) : (
                      <>
                        <div className="bg-zinc-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Film className="w-6 h-6 opacity-50" />
                        </div>
                        <p>Video preview</p>
                        <p className="text-sm opacity-60">Animate your logo to see it here</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {appState === AppState.VIDEO_READY && video && (
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = video.url;
                    a.download = 'logomotion-export.mp4';
                    a.click();
                  }}
                >
                  Download Video
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;