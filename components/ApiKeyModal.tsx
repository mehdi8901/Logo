import React from 'react';
import { Button } from './Button';
import { Key } from 'lucide-react';

interface ApiKeyModalProps {
  onSelectKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSelectKey }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-indigo-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">API Key Required</h2>
          <p className="text-zinc-400 text-sm">
            To use Veo video generation features, you need to select a project with billing enabled.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button onClick={onSelectKey} className="w-full" icon={<Key className="w-4 h-4"/>}>
            Select API Key
          </Button>
          
          <div className="text-xs text-zinc-500 text-center">
            <p>
              Make sure to check the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">billing documentation</a> for more information on pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};