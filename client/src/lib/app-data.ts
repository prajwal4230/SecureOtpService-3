import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { 
  MessageSquare, 
  Instagram, 
  Facebook, 
  Mail, 
  Send, 
  Twitter, 
  Camera, 
  Music, 
  Briefcase, 
  ShoppingCart, 
  Film, 
  Headphones,
  Phone,
  ThumbsUp,
  MapPin,
  Zap,
  Share2,
  User,
  DollarSign,
  Globe
} from 'lucide-react';

export interface App {
  id: number;
  name: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
}

export function getAllApps(): App[] {
  return [
    { id: 1, name: 'WhatsApp', price: 2.5, icon: MessageSquare },
    { id: 2, name: 'Instagram', price: 3.0, icon: Instagram },
    { id: 3, name: 'Facebook', price: 2.0, icon: Facebook },
    { id: 4, name: 'Gmail', price: 3.5, icon: Mail },
    { id: 5, name: 'Telegram', price: 2.5, icon: Send },
    { id: 6, name: 'Twitter', price: 2.0, icon: Twitter },
    { id: 7, name: 'Snapchat', price: 3.0, icon: Camera },
    { id: 8, name: 'TikTok', price: 3.5, icon: Music },
    { id: 9, name: 'LinkedIn', price: 4.0, icon: Briefcase },
    { id: 10, name: 'Amazon', price: 3.0, icon: ShoppingCart },
    { id: 11, name: 'Netflix', price: 4.5, icon: Film },
    { id: 12, name: 'Spotify', price: 2.5, icon: Headphones },
    { id: 13, name: 'Uber', price: 3.0, icon: MapPin },
    { id: 14, name: 'Zomato', price: 2.0, icon: ThumbsUp },
    { id: 15, name: 'Swiggy', price: 2.0, icon: Zap },
    { id: 16, name: 'Paytm', price: 2.5, icon: DollarSign },
    { id: 17, name: 'PhonePe', price: 2.5, icon: Phone },
    { id: 18, name: 'Google Pay', price: 2.5, icon: Globe },
    { id: 19, name: 'ShareChat', price: 3.0, icon: Share2 },
    { id: 20, name: 'Tinder', price: 3.5, icon: User }
  ];
}

export function getAppById(id: number): App | undefined {
  return getAllApps().find(app => app.id === id);
}

export function getAppByName(name: string): App | undefined {
  return getAllApps().find(app => app.name.toLowerCase() === name.toLowerCase());
}
