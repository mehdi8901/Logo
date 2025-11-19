import React, { useState, useCallback } from 'react';
import { Button } from './Button';
import { Upload, Wand2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface LogoGeneratorProps {
  onImageReady: (image: GeneratedImage) => void;
  isGenerating: boolean;
  onGenerate: (prompt: string) => void;
}

export const LogoGenerator: React.FC<LogoGeneratorProps> = ({ onImageReady, isGenerating, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'upload'>('generate');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64 data, removing the data URL prefix
        const base64 = result.split(',')[1];
        const mimeType = file.type;
        onImageReady({ base64, mimeType });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageReady]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex space-x-4 mb-6 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('generate')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'generate' 
              ? 'text-indigo-400 border-b-2 border-indigo-400 -mb-2.5' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Generate New Logo
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'upload' 
              ? 'text-indigo-400 border-b-2 border-indigo-400 -mb-2.5' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Upload Existing
        </button>
      </div>

      {activeTab === 'generate' ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-2">
              Describe your company
            </label>
            <textarea
              id="prompt"
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="e.g. A futuristic cyber security firm with a shield and digital nodes, neon blue and black colors..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => onGenerate(prompt)} 
            isLoading={isGenerating}
            disabled={!prompt.trim()}
            className="w-full"
            icon={<Wand2 className="w-4 h-4" />}
          >
            Design Logo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-800/50 transition-colors">
            <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
            <p className="text-sm text-zinc-300 mb-1">Click to upload your logo</p>
            <p className="text-xs text-zinc-500">PNG, JPG up to 5MB</p>
            <input
              type="file"
              className="hidden"
              id="file-upload"
              accept="image/*"
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="file-upload" 
              className="absolute inset-0 cursor-pointer"
              aria-label="Upload logo"
            />
          </div>
        </div>
      )}
    </div>
  );
};