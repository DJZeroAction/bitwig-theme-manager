import { useState, useRef, useEffect, memo, useCallback } from "react";
import {
  addGlobalRecentColor,
  getGlobalRecentColors,
  subscribeToRecentColors,
} from "../hooks/useRecentColors";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export const ColorPicker = memo(function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  // Only load recent colors when picker is opened (lazy load)
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Only subscribe to recent colors when picker is open - prevents 265+ subscriptions
  useEffect(() => {
    if (!isOpen) return;

    // Load current colors when opening
    setRecentColors(getGlobalRecentColors());

    // Subscribe for updates while open
    return subscribeToRecentColors(() => {
      setRecentColors(getGlobalRecentColors());
    });
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  }, [onChange]);

  const handleNativeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    onChange(newValue);
    // Add to recent colors when picker is closed or color is selected
    addGlobalRecentColor(newValue);
  }, [onChange]);

  const handleRecentColorClick = useCallback((color: string) => {
    setInputValue(color);
    onChange(color);
    setIsOpen(false);
  }, [onChange]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div ref={pickerRef} className="relative">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleOpen}
          className="w-10 h-10 rounded-lg border-2 border-gray-600 hover:border-purple-500 transition-colors cursor-pointer shadow-inner"
          style={{ background: value }}
          title={`${label}: ${value}`}
        />
        <div className="flex-1">
          <div className="text-sm text-gray-300">{label}</div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-transparent text-xs text-gray-400 font-mono focus:outline-none focus:text-white"
            placeholder="#000000"
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-12 left-0 z-10 bg-gray-700 rounded-lg p-3 shadow-xl border border-gray-600">
          <input
            type="color"
            value={value.substring(0, 7)}
            onChange={handleNativeChange}
            className="w-32 h-32 cursor-pointer border-0 rounded"
          />
          <div className="mt-2 text-center text-sm text-gray-400">{value}</div>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="text-xs text-gray-500 mb-2">Recent</div>
              <div className="flex flex-wrap gap-1">
                {recentColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => handleRecentColorClick(color)}
                    className="w-6 h-6 rounded border border-gray-500 hover:border-purple-400 transition-colors"
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

interface ColorGroupProps {
  name: string;
  colors: Array<{ key: string; value: string; label: string }>;
  onChange: (key: string, value: string) => void;
}

export function ColorGroup({ name, colors, onChange }: ColorGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-750 transition-colors"
      >
        <h3 className="font-semibold">{name}</h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-4">
          {colors.map((color) => (
            <ColorPicker
              key={color.key}
              label={color.label}
              value={color.value}
              onChange={(value) => onChange(color.key, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
