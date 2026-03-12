import { useState, useMemo, memo, useCallback } from "react";
import { ColorPicker } from "./ColorPicker";
import { addGlobalRecentColor } from "../hooks/useRecentColors";
import type { PropertyDefinition } from "../data/properties";

interface ModeToggleConfig {
  modes: { id: string; name: string; description: string }[];
  defaultMode: string;
}

interface CategoryEditorProps {
  categoryName: string;
  description: string;
  properties: PropertyDefinition[];
  values: Record<string, string>;
  basePropertyKey: string;
  onChange: (key: string, value: string) => void;
  onGroupColorChange?: (color: string) => void;
  defaultExpanded?: boolean;
  modeToggle?: ModeToggleConfig;
  currentMode?: string;
  onModeChange?: (mode: string) => void;
}

export const CategoryEditor = memo(function CategoryEditor({
  categoryName,
  description,
  properties,
  values,
  basePropertyKey,
  onChange,
  onGroupColorChange,
  defaultExpanded = false,
  modeToggle,
  currentMode,
  onModeChange,
}: CategoryEditorProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Get the base color for this category
  const baseColor = useMemo(() => {
    return values[basePropertyKey] || "#808080";
  }, [values, basePropertyKey]);

  // Count how many properties have been modified from defaults
  const modifiedCount = useMemo(() => {
    return properties.filter(p => {
      const currentValue = values[p.key];
      return currentValue && currentValue.toUpperCase() !== p.defaultValue.toUpperCase();
    }).length;
  }, [properties, values]);

  // Get preview colors (first few colors in the category)
  const previewColors = useMemo(() => {
    return properties.slice(0, 4).map(p => values[p.key] || p.defaultValue);
  }, [properties, values]);

  const handleGroupColorChange = useCallback((color: string) => {
    // Add to recent colors
    addGlobalRecentColor(color);

    if (onGroupColorChange) {
      onGroupColorChange(color);
    } else {
      // Default: just update the base property
      onChange(basePropertyKey, color);
    }
  }, [onGroupColorChange, onChange, basePropertyKey]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Category Header */}
      <button
        onClick={toggleExpanded}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-750 transition-colors"
      >
        {/* Expand/Collapse Arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>

        {/* Category Name & Count */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{categoryName}</h3>
            <span className="text-xs text-gray-500">({properties.length})</span>
            {modifiedCount > 0 && (
              <span className="text-xs bg-purple-600/50 text-purple-200 px-1.5 py-0.5 rounded">
                {modifiedCount} modified
              </span>
            )}
          </div>
          {!isExpanded && (
            <p className="text-xs text-gray-500 truncate">{description}</p>
          )}
        </div>

        {/* Preview Colors */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {previewColors.map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded border border-gray-600"
              style={{ background: color }}
              title={properties[i]?.key}
            />
          ))}
        </div>

        {/* Group Color Picker (click stops propagation) */}
        <div
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={baseColor.substring(0, 7)} // Strip alpha for color input
              onChange={(e) => handleGroupColorChange(e.target.value.toUpperCase())}
              className="w-8 h-8 rounded cursor-pointer border-2 border-gray-600 hover:border-purple-500"
              title="Group base color"
            />
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700">
          {/* Description */}
          <p className="text-sm text-gray-400 py-2">{description}</p>

          {/* Mode Toggle (for knobs and meters) */}
          {modeToggle && onModeChange && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-gray-900 rounded-lg">
              <span className="text-xs text-gray-400 mr-2">Style:</span>
              {modeToggle.modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    currentMode === mode.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  title={mode.description}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          )}

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {properties.map((property) => {
              const value = values[property.key] || property.defaultValue;
              const isModified = value.toUpperCase() !== property.defaultValue.toUpperCase();

              return (
                <div
                  key={property.key}
                  className={`relative ${isModified ? "ring-1 ring-purple-500/30 rounded-lg" : ""}`}
                >
                  <ColorPicker
                    label={property.key}
                    value={value}
                    onChange={(newValue) => onChange(property.key, newValue)}
                  />
                  {/* Modified indicator */}
                  {isModified && (
                    <button
                      onClick={() => onChange(property.key, property.defaultValue)}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center"
                      title={`Reset to default: ${property.defaultValue}`}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {/* Description tooltip */}
                  {property.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate" title={property.description}>
                      {property.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
