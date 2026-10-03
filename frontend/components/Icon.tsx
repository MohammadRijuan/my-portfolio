import { GraduationCap, MapPin, BookOpen, Code2, Server, Database, Monitor, Github, Linkedin, Facebook, Twitter, Instagram, Youtube, Mail, Globe, Rocket, Sparkles, Leaf, ShoppingCart, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
export const icons: Record<string, LucideIcon> = {
  edu: GraduationCap, pin: MapPin, book: BookOpen, code: Code2, server: Server, db: Database, monitor: Monitor,
  github: Github, linkedin: Linkedin, facebook: Facebook, twitter: Twitter, instagram: Instagram, youtube: Youtube,
  mail: Mail, globe: Globe, rocket: Rocket, sparkles: Sparkles, leaf: Leaf, cart: ShoppingCart, whatsapp: MessageCircle, phone: Phone,
};
export default function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  const I = icons[name] || Code2;
  return <I size={size} className={className} />;
}
