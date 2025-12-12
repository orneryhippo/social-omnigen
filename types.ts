export enum SocialPlatform {
  LINKEDIN = 'LinkedIn',
  TWITTER = 'Twitter/X',
  INSTAGRAM = 'Instagram'
}

export enum Tone {
  PROFESSIONAL = 'Professional',
  WITTY = 'Witty',
  URGENT = 'Urgent',
  CASUAL = 'Casual',
  INSPIRATIONAL = 'Inspirational'
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface GeneratedContent {
  linkedin: {
    text: string;
    imagePrompt: string;
  };
  twitter: {
    text: string;
    imagePrompt: string;
  };
  instagram: {
    text: string;
    imagePrompt: string;
  };
}

export interface PostData {
  platform: SocialPlatform;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
  isLoadingImage: boolean;
  aspectRatio: AspectRatio;
}

export interface GenerationSettings {
  tone: Tone;
  imageSize: ImageSize;
  forceAspectRatio: AspectRatio | 'Auto';
}
