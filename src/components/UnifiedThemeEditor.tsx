import { useMemo, useState } from "react";
import { CategoryEditor } from "./CategoryEditor";
import {
  getPropertiesForVersion,
  getDefaultValues,
  type BitwigVersion,
  type PropertyDefinition,
} from "../data/properties";
import {
  CATEGORIES,
  getCategoryBaseProperty,
  HIGH_IMPACT_CATEGORIES,
} from "../data/properties/categories";
import type { Theme } from "../api/types";

interface UnifiedThemeEditorProps {
  theme: Theme;
  bitwigVersion: BitwigVersion;
  onColorChange: (key: string, value: string) => void;
  onVersionChange?: (version: BitwigVersion) => void;
}

export function UnifiedThemeEditor({
  theme,
  bitwigVersion,
  onColorChange,
  onVersionChange,
}: UnifiedThemeEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyModified, setShowOnlyModified] = useState(false);

  // Get all properties for the current version
  const versionProperties = useMemo(() => {
    return getPropertiesForVersion(bitwigVersion);
  }, [bitwigVersion]);

  // Get default values for population
  const defaultValues = useMemo(() => {
    return getDefaultValues(bitwigVersion);
  }, [bitwigVersion]);

  // Merge theme colors with defaults (populate missing properties)
  const populatedValues = useMemo(() => {
    const result: Record<string, string> = {};

    // Start with defaults
    for (const [key, value] of Object.entries(defaultValues)) {
      result[key] = value;
    }

    // Override with theme values
    for (const [key, value] of Object.entries(theme.colors)) {
      if (key in result) {
        result[key] = value;
      }
    }

    return result;
  }, [theme.colors, defaultValues]);

  // Group properties by category
  const categorizedProperties = useMemo(() => {
    const byCategory = new Map<string, PropertyDefinition[]>();

    for (const prop of versionProperties) {
      const existing = byCategory.get(prop.category) || [];
      existing.push(prop);
      byCategory.set(prop.category, existing);
    }

    return byCategory;
  }, [versionProperties]);

  // Filter properties by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery && !showOnlyModified) {
      return CATEGORIES.filter(cat => categorizedProperties.has(cat.id));
    }

    const query = searchQuery.toLowerCase();
    const result: typeof CATEGORIES = [];

    for (const category of CATEGORIES) {
      const props = categorizedProperties.get(category.id);
      if (!props) continue;

      const filteredProps = props.filter(p => {
        // Search filter
        const matchesSearch = !query ||
          p.key.toLowerCase().includes(query) ||
          (p.description?.toLowerCase().includes(query) ?? false);

        // Modified filter
        const isModified = showOnlyModified
          ? (populatedValues[p.key] || "").toUpperCase() !== (p.defaultValue || "").toUpperCase()
          : true;

        return matchesSearch && isModified;
      });

      if (filteredProps.length > 0) {
        result.push(category);
      }
    }

    return result;
  }, [searchQuery, showOnlyModified, categorizedProperties, populatedValues]);

  // Get filtered properties for a category
  const getFilteredPropertiesForCategory = (categoryId: string): PropertyDefinition[] => {
    const props = categorizedProperties.get(categoryId) || [];

    if (!searchQuery && !showOnlyModified) {
      return props;
    }

    const query = searchQuery.toLowerCase();
    return props.filter(p => {
      const matchesSearch = !query ||
        p.key.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query) ?? false);

      const isModified = showOnlyModified
        ? (populatedValues[p.key] || "").toUpperCase() !== (p.defaultValue || "").toUpperCase()
        : true;

      return matchesSearch && isModified;
    });
  };

  // Count total and modified properties
  const { totalCount, modifiedCount } = useMemo(() => {
    let total = 0;
    let modified = 0;

    for (const prop of versionProperties) {
      total++;
      const currentValue = populatedValues[prop.key] || "";
      if (currentValue.toUpperCase() !== prop.defaultValue.toUpperCase()) {
        modified++;
      }
    }

    return { totalCount: total, modifiedCount: modified };
  }, [versionProperties, populatedValues]);

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Version Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Bitwig Version:</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-600">
              <button
                onClick={() => onVersionChange?.("5")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  bitwigVersion === "5"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                BW5
              </button>
              <button
                onClick={() => onVersionChange?.("6")}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  bitwigVersion === "6"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                BW6
              </button>
            </div>
          </div>

          {/* Property Count */}
          <div className="text-sm text-gray-400">
            {totalCount} properties
            {modifiedCount > 0 && (
              <span className="text-purple-400 ml-2">
                ({modifiedCount} modified)
              </span>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyModified}
              onChange={(e) => setShowOnlyModified(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Modified only</span>
          </label>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {filteredCategories.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            {searchQuery || showOnlyModified
              ? "No properties match your filters"
              : "No properties available"}
          </div>
        ) : (
          filteredCategories.map((category) => {
            const props = getFilteredPropertiesForCategory(category.id);
            const baseKey = getCategoryBaseProperty(category.id, bitwigVersion);

            return (
              <CategoryEditor
                key={category.id}
                categoryName={category.name}
                description={category.description}
                properties={props}
                values={populatedValues}
                basePropertyKey={baseKey}
                onChange={onColorChange}
                defaultExpanded={HIGH_IMPACT_CATEGORIES.includes(category.id) && !searchQuery}
              />
            );
          })
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500 text-center py-2">
        Click category headers to expand/collapse • Click reset button to restore defaults
      </div>
    </div>
  );
}
