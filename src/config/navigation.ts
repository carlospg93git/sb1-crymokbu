import { Home, Info, Church, Clock, MapPin, Camera, Users, Utensils, Bus } from 'lucide-react';

export interface NavItem {
  path: string;
  icon: any;
  label: string;
}

export const navItems: NavItem[] = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/info', icon: Info, label: 'Información' },
  { path: '/ceremonia', icon: Church, label: 'Ceremonia' },
  { path: '/horarios', icon: Clock, label: 'Horarios' },
  { path: '/lugares', icon: MapPin, label: 'Lugares' },
  { path: '/transporte', icon: Bus, label: 'Transporte' },
  { path: '/fotos', icon: Camera, label: 'Fotos' },
  { path: '/mesas', icon: Users, label: 'Seating plan' },
  { path: '/menu', icon: Utensils, label: 'Menú' }
]; 