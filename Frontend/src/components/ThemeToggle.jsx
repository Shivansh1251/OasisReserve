import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle({ compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme} className={compact ? 'glass-button h-10 px-3' : 'glass-button'}>
      {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {!compact && <span>{isDark ? 'Light' : 'Dark'} mode</span>}
    </button>
  );
}