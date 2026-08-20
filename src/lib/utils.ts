import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
    'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700'
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(name: string) {
  const parts = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getPositionBadgeColor(position: string) {
  const pos = position.toLowerCase();
  if (pos.includes('doctor') || pos.includes('surgeon') || pos.includes('physician')) return 'bg-indigo-100 text-indigo-700';
  if (pos.includes('nurse')) return 'bg-teal-100 text-teal-700';
  if (pos.includes('manager') || pos.includes('chief') || pos.includes('director')) return 'bg-purple-100 text-purple-700';
  if (pos.includes('admin') || pos.includes('hr')) return 'bg-amber-100 text-amber-700';
  if (pos.includes('it') || pos.includes('tech')) return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-700';
}
