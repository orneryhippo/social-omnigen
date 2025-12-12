import React from 'react';
import { Settings2, Monitor, Square, Smartphone, Type, Image as ImageIcon } from 'lucide-react';
import { GenerationSettings, Tone, ImageSize, AspectRatio } from '../types';

interface SettingsPanelProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  
  const updateSetting = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
        <Settings2 className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-800">Generation Preferences</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tone Selector */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Type className="w-4 h-4" />
            Content Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.values(Tone).map((tone) => (
              <button
                key={tone}
                onClick={() => updateSetting('tone', tone)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  settings.tone === tone
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium ring-1 ring-indigo-200'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Image Size Selector */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <ImageIcon className="w-4 h-4" />
            Image Resolution
          </label>
          <select
            value={settings.imageSize}
            onChange={(e) => updateSetting('imageSize', e.target.value as ImageSize)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
          >
            {Object.values(ImageSize).map((size) => (
              <option key={size} value={size}>
                {size} Quality
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400">Higher resolution may take slightly longer.</p>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="space-y-3">
           <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Monitor className="w-4 h-4" />
            Aspect Ratio
          </label>
          <select
            value={settings.forceAspectRatio}
            onChange={(e) => updateSetting('forceAspectRatio', e.target.value as AspectRatio | 'Auto')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
          >
            <option value="Auto">Auto (Platform Optimized)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="3:4">3:4 (Portrait)</option>
            <option value="4:3">4:3 (Landscape)</option>
            <option value="9:16">9:16 (Story/Reel)</option>
            <option value="16:9">16:9 (Wide)</option>
          </select>
          <p className="text-xs text-gray-400">"Auto" selects the best fit for each platform.</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsPanel;
