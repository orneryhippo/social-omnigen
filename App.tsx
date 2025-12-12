import React, { useState, useEffect } from 'react';
import { Sparkles, KeyRound } from 'lucide-react';
import { 
  SocialPlatform, 
  PostData, 
  GenerationSettings, 
  Tone, 
  ImageSize, 
  AspectRatio, 
  GeneratedContent 
} from './types';
import SettingsPanel from './components/SettingsPanel';
import PostCard from './components/PostCard';
import { generateSocialText, generateSocialImage } from './services/gemini';

const App: React.FC = () => {
  const [apiKeySet, setApiKeySet] = useState(false);
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    tone: Tone.PROFESSIONAL,
    imageSize: ImageSize.SIZE_1K,
    forceAspectRatio: 'Auto'
  });

  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setApiKeySet(hasKey);
    } else {
      // Fallback for development if not in the specific environment, 
      // though the prompt implies we are. 
      // If process.env.API_KEY is present, we assume it's good.
      if (process.env.API_KEY) setApiKeySet(true);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions
      setApiKeySet(true);
    } else {
      setError("AI Studio environment not detected.");
    }
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsGenerating(true);
    setError(null);
    setPosts([]);

    try {
      // 1. Generate Text Content
      const content = await generateSocialText(idea, settings.tone);
      
      // 2. Prepare Post Data placeholders
      const getRatio = (platform: SocialPlatform): AspectRatio => {
        if (settings.forceAspectRatio !== 'Auto') return settings.forceAspectRatio;
        switch (platform) {
          case SocialPlatform.LINKEDIN: return '3:4'; // Professional portrait
          case SocialPlatform.TWITTER: return '16:9'; // Landscape feed
          case SocialPlatform.INSTAGRAM: return '1:1'; // Square
          default: return '1:1';
        }
      };

      const newPosts: PostData[] = [
        {
          platform: SocialPlatform.LINKEDIN,
          content: content.linkedin.text,
          imagePrompt: content.linkedin.imagePrompt,
          isLoadingImage: true,
          aspectRatio: getRatio(SocialPlatform.LINKEDIN)
        },
        {
          platform: SocialPlatform.TWITTER,
          content: content.twitter.text,
          imagePrompt: content.twitter.imagePrompt,
          isLoadingImage: true,
          aspectRatio: getRatio(SocialPlatform.TWITTER)
        },
        {
          platform: SocialPlatform.INSTAGRAM,
          content: content.instagram.text,
          imagePrompt: content.instagram.imagePrompt,
          isLoadingImage: true,
          aspectRatio: getRatio(SocialPlatform.INSTAGRAM)
        }
      ];

      setPosts(newPosts);

      // 3. Trigger Image Generation in Parallel
      // We map over the posts we just created to keep references clean
      const imagePromises = newPosts.map(async (post, index) => {
        try {
          const base64Image = await generateSocialImage(
            post.imagePrompt,
            post.aspectRatio,
            settings.imageSize
          );
          
          setPosts(currentPosts => {
            const updated = [...currentPosts];
            if (updated[index]) {
              updated[index] = { ...updated[index], imageUrl: base64Image, isLoadingImage: false };
            }
            return updated;
          });
        } catch (err) {
          console.error(`Failed to generate image for ${post.platform}`, err);
          setPosts(currentPosts => {
             const updated = [...currentPosts];
             if (updated[index]) {
               updated[index] = { ...updated[index], isLoadingImage: false }; // Stop loading even if failed
             }
             return updated;
          });
        }
      });

      await Promise.all(imagePromises);

    } catch (err) {
      console.error(err);
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImage = async (index: number) => {
    const post = posts[index];
    if (!post) return;

    setPosts(current => {
      const updated = [...current];
      updated[index] = { ...updated[index], isLoadingImage: true };
      return updated;
    });

    try {
      const base64Image = await generateSocialImage(
        post.imagePrompt,
        post.aspectRatio,
        settings.imageSize
      );
      setPosts(current => {
        const updated = [...current];
        updated[index] = { ...updated[index], imageUrl: base64Image, isLoadingImage: false };
        return updated;
      });
    } catch (err) {
      setPosts(current => {
        const updated = [...current];
        updated[index] = { ...updated[index], isLoadingImage: false };
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Social OmniGen
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {!apiKeySet && (
              <button 
                onClick={handleSelectKey}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Select API Key
              </button>
             )}
             {apiKeySet && (
               <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Gemini Pro Active
               </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Once, Publish Everywhere</h2>
          <p className="text-gray-500 text-lg">
            Transform a single idea into tailored posts and unique visuals for LinkedIn, X, and Instagram instantly.
          </p>
        </div>

        {/* Input Section */}
        <section className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
             <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="What's on your mind? (e.g., 'Launching a new eco-friendly coffee cup line made from bamboo')"
                className="w-full h-32 p-4 text-lg resize-none outline-none rounded-lg focus:bg-gray-50 transition-colors"
             />
             <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center rounded-b-lg">
                <span className="text-xs text-gray-400 font-medium">
                  {idea.length} characters
                </span>
                <div className="text-xs text-gray-400">
                  Powered by Gemini 2.5 Flash & 3 Pro
                </div>
             </div>
          </div>

          <SettingsPanel settings={settings} onChange={setSettings} />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !apiKeySet || !idea.trim()}
            className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3
              ${isGenerating || !apiKeySet || !idea.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/30'
              }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Crafting Content...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Social Pack
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
        </section>

        {/* Results Grid */}
        {posts.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {posts.map((post, index) => (
              <PostCard 
                key={post.platform} 
                post={post} 
                onRegenerateImage={() => handleRegenerateImage(index)}
              />
            ))}
          </section>
        )}

      </main>
      
      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Social OmniGen. Built with Google Gemini.
      </footer>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        /* Custom scrollbar for text areas */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7c7c7; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8; 
        }
      `}</style>
    </div>
  );
};

export default App;