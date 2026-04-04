import * as Icons from 'lucide-react';
import React from 'react';

/**
 * Normalizes a string to PascalCase
 * e.g., "car" -> "Car", "sports-car" -> "SportsCar", "SCOOTER" -> "Scooter"
 */
const toPascalCase = (str) => {
  if (!str) return '';
  return str
    .match(/[a-z]+/gi)
    ?.map((word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
    .join('') || '';
};

/**
 * Resolves a lucide-react icon component dynamically from a string name.
 * Provides a highly reliable fallback mechanism.
 */
export const resolveIcon = (name, FallbackIcon = Icons.Tag) => {
  if (!name) return FallbackIcon;
  
  const formattedName = toPascalCase(name);
  const IconComponent = Icons[formattedName];
  
  if (!IconComponent) {
    // If not found, try stripping an 's' from the end (e.g., Bikes -> Bike, Cars -> Car)
    if (formattedName.endsWith('s')) {
      const singularName = formattedName.slice(0, -1);
      if (Icons[singularName]) return Icons[singularName];
    }
    console.warn(`IconResolver: Could not map "${name}" to a valid lucide-react icon.`);
    return FallbackIcon;
  }
  
  return IconComponent;
};

/**
 * Read-to-use dynamic icon component
 */
export const DynamicIcon = ({ name, size = 24, className = '', fallback = 'Tag' }) => {
  const FallbackComponent = Icons[fallback] || Icons.Tag;
  const Icon = resolveIcon(name, FallbackComponent);
  
  return <Icon size={size} className={className} />;
};
