export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: number;
}

export type ViewType = 'chat' | 'image' | 'image-edit' | 'code' | 'code-edit' | 'search' | 'analyze' | 'file-analyze' | 'pricing' | 'video' | 'music' | 'translate';
