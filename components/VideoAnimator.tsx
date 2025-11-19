import React, { useState } from 'react';
import { Button } from './Button';
import { Clapperboard } from 'lucide-react';

interface VideoAnimatorProps {
  onAnimate: (prompt: string) => void;
  isAnimating: boolean;
}

export const VideoAnimator: React.FC<VideoAnimatorProps> = ({ onAnimate, isAnimating }) => {
  const [prompt, setPrompt] = useState('Cinematic slow motion reveal of this logo, with subtle lighting effects and 3D rotation.');

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm mt-4">
      <h3 className="text-lg font-semibold text-white mb-4">Animate Logo</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="anim-prompt" className="block text-sm font-medium text-zinc-300 mb-2">
            Animation Style
          </label>
          <textarea
            id="anim-prompt"
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={() => onAnimate(prompt)} 
          isLoading={isAnimating}
          className="w-full"
          icon={<Clapperboard className="w-4 h-4" />}
          variant="secondary"
        >
          Generate Animation (Veo)
        </Button>
      </div>
    </div>
  );
};