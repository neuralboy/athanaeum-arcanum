import { ReactNode } from 'react';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  date: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  images?: string[];
  status?: string;
  accessibility?: string;
}
