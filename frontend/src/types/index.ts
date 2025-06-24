export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  language: Language;
}

export type Language = 'english' | 'hindi';