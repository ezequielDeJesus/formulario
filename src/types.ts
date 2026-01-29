
export type QuestionType = 'text' | 'longtext' | 'email' | 'phone' | 'number' | 'select';

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[]; // Used for 'select'
  required?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrls: string[];
  ctaLink: string;
}

export interface FormConfig {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  logo?: string;
  primaryColor: string;
  theme: 'light' | 'dark'; // Novo campo
  questions: Question[];
  aiResponsePrompt: string;
  products: Product[];
  expertLink?: string;
  createdAt: any;
  userId?: string;
}

export interface Lead {
  id: string;
  formId: string;
  formName: string;
  answers: Record<string, string>;
  aiResponse: string;
  timestamp: number;
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
  userId?: string;
}

export interface User {
  isAuthenticated: boolean;
}
