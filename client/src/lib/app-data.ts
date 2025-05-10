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
  Globe,
  Shield,
  Smartphone,
  CreditCard,
  Heart,
  BookOpen,
  Truck,
  Utensils,
  BarChart,
  Activity,
  Package,
  Calendar,
  Home,
  Cloud,
  Compass,
  Search,
  Star,
  Video,
  Map,
  Lock,
  CheckCircle,
  PlayCircle,
  Settings,
  Layers,
  MessageCircle,
  Bell,
  FileText,
  Wifi,
  HardDrive,
  Upload,
  Download,
  Edit,
  Image,
  Paperclip,
  Coffee,
  Gift,
  Key,
  Radio,
  Bookmark,
  Tag,
  Database,
  MoreHorizontal,
  Train,
  HelpCircle
} from 'lucide-react';

export interface App {
  id: number;
  name: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
}

// Helper function to generate icons for additional apps
function getIconForApp(index: number): React.ComponentType<{ className?: string }> {
  const allIcons = [
    MessageSquare, Instagram, Facebook, Mail, Send, Twitter, Camera, Music, 
    Briefcase, ShoppingCart, Film, Headphones, Phone, ThumbsUp, MapPin, Zap, Share2, 
    User, DollarSign, Globe, Shield, Smartphone, CreditCard, Heart, BookOpen, Truck, 
    Utensils, BarChart, Activity, Package, Calendar, Home, Cloud, Compass, Search, Star, 
    Video, Map, Lock, CheckCircle, PlayCircle, Settings, Layers, MessageCircle, Bell, 
    FileText, Wifi, HardDrive, Upload, Download, Edit, Image, Paperclip, Coffee, Gift, 
    Key, Radio, Bookmark, Tag, Database, MoreHorizontal, Train, HelpCircle
  ];
  
  return allIcons[index % allIcons.length];
}

// Generate random price between 1.5 and 5.0
function getRandomPrice(): number {
  return Math.round((Math.random() * 3.5 + 1.5) * 10) / 10; // Random price between 1.5 and 5.0 with one decimal place
}

export function getAllApps(): App[] {
  // Popular apps with fixed details
  const popularApps = [
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
    { id: 20, name: 'Tinder', price: 3.5, icon: User },
    { id: 21, name: 'Flipkart', price: 3.0, icon: ShoppingCart },
    { id: 22, name: 'MakeMyTrip', price: 4.0, icon: Compass },
    { id: 23, name: 'Myntra', price: 3.0, icon: ShoppingCart },
    { id: 24, name: 'Hotstar', price: 4.5, icon: PlayCircle },
    { id: 25, name: 'Ola', price: 3.0, icon: MapPin },
    { id: 26, name: 'Amazon Prime', price: 4.5, icon: Film },
    { id: 27, name: 'JioSaavn', price: 2.5, icon: Headphones },
    { id: 28, name: 'Airtel', price: 3.0, icon: Phone },
    { id: 29, name: 'Jio', price: 3.0, icon: Phone },
    { id: 30, name: 'Vodafone', price: 3.0, icon: Phone },
    { id: 31, name: 'IRCTC', price: 4.0, icon: Train },
    { id: 32, name: 'SBI', price: 5.0, icon: CreditCard },
    { id: 33, name: 'HDFC Bank', price: 5.0, icon: CreditCard },
    { id: 34, name: 'ICICI Bank', price: 5.0, icon: CreditCard },
    { id: 35, name: 'PayPal', price: 3.5, icon: DollarSign },
    { id: 36, name: 'BHIM', price: 2.5, icon: DollarSign },
    { id: 37, name: 'Freecharge', price: 2.5, icon: DollarSign },
    { id: 38, name: 'Mobikwik', price: 2.5, icon: DollarSign },
    { id: 39, name: 'BookMyShow', price: 3.5, icon: Film },
    { id: 40, name: 'Yatra', price: 4.0, icon: Compass },
    { id: 41, name: 'Quora', price: 2.0, icon: HelpCircle },
    { id: 42, name: 'Zoom', price: 4.0, icon: Video },
    { id: 43, name: 'Microsoft Teams', price: 4.0, icon: Video },
    { id: 44, name: 'Skype', price: 3.0, icon: Video },
    { id: 45, name: 'Discord', price: 3.0, icon: MessageCircle },
    { id: 46, name: 'Pinterest', price: 2.5, icon: Image },
    { id: 47, name: 'Reddit', price: 2.5, icon: MessageCircle },
    { id: 48, name: 'Truecaller', price: 3.0, icon: Phone },
    { id: 49, name: 'Adobe Photoshop', price: 5.0, icon: Image },
    { id: 50, name: 'MS Office', price: 4.5, icon: FileText }
  ];
  
  // Generate additional 950+ apps to have more than 1000 total
  const additionalApps = [];
  const categories = [
    'Bank', 'Finance', 'Shopping', 'Travel', 'Food', 'Education', 'Health', 
    'Entertainment', 'Music', 'Utility', 'Messaging', 'Social', 'News', 'Dating', 
    'Sports', 'Game', 'Business', 'Lifestyle', 'Weather', 'Fitness'
  ];
  
  for (let i = 51; i <= 1005; i++) {
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const category = categories[categoryIndex];
    const number = i - 50;
    
    additionalApps.push({
      id: i,
      name: `${category} App ${number}`,
      price: getRandomPrice(),
      icon: getIconForApp(i)
    });
  }
  
  return [...popularApps, ...additionalApps];
}

export function getAppById(id: number): App | undefined {
  return getAllApps().find(app => app.id === id);
}

export function getAppByName(name: string): App | undefined {
  return getAllApps().find(app => app.name.toLowerCase() === name.toLowerCase());
}
