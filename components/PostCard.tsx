import React from 'react';
import { Copy, RefreshCw, Download, Share2, Linkedin, Instagram, Twitter } from 'lucide-react';
import { PostData, SocialPlatform } from '../types';

interface PostCardProps {
  post: PostData;
  onRegenerateImage: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onRegenerateImage }) => {
  const getIcon = () => {
    switch (post.platform) {
      case SocialPlatform.LINKEDIN: return <Linkedin className="w-5 h-5 text-blue-700" />;
      case SocialPlatform.TWITTER: return <Twitter className="w-5 h-5 text-black" />; // X logo is complex, using standard Twitter icon for simplicity or Lucide's Twitter
      case SocialPlatform.INSTAGRAM: return <Instagram className="w-5 h-5 text-pink-600" />;
    }
  };

  const getLabel = () => {
    switch (post.platform) {
      case SocialPlatform.LINKEDIN: return "LinkedIn";
      case SocialPlatform.TWITTER: return "X / Twitter";
      case SocialPlatform.INSTAGRAM: return "Instagram";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(post.content);
    // Could add toast here
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          {getIcon()}
          <span>{getLabel()}</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-gray-200"
          title="Copy Text"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-4">
        
        {/* Text Body */}
        <div className="text-sm text-gray-700 whitespace-pre-wrap flex-1 min-h-[120px] max-h-[200px] overflow-y-auto custom-scrollbar">
          {post.content}
        </div>

        {/* Image Section */}
        <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
          
          {/* Aspect Ratio Box Wrapper to prevent layout shift */}
          <div className={`w-full relative ${
            post.aspectRatio === '1:1' ? 'aspect-square' :
            post.aspectRatio === '16:9' ? 'aspect-video' :
            post.aspectRatio === '9:16' ? 'aspect-[9/16]' :
            post.aspectRatio === '3:4' ? 'aspect-[3/4]' : 'aspect-video'
          }`}>
             {post.isLoadingImage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                 <div className="flex flex-col items-center gap-2">
                   <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                   <span className="text-xs text-gray-500 font-medium animate-pulse">Generating Visuals...</span>
                 </div>
              </div>
            ) : post.imageUrl ? (
              <img 
                src={post.imageUrl} 
                alt={`${post.platform} visual`} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                 Image failed to load
               </div>
            )}

            {/* Overlay Actions */}
            {!post.isLoadingImage && post.imageUrl && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                 <a 
                  href={post.imageUrl} 
                  download={`omnigen-${post.platform.toLowerCase()}.png`}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                  title="Download"
                 >
                   <Download className="w-5 h-5" />
                 </a>
                 <button 
                  onClick={onRegenerateImage}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                  title="Regenerate Image"
                 >
                   <RefreshCw className="w-5 h-5" />
                 </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-400 text-center">
            Ratio: {post.aspectRatio}
        </div>

      </div>
    </div>
  );
};

export default PostCard;
