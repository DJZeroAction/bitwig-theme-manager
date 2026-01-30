import { useMemo, useState, useCallback } from "react";
import { CategoryEditor } from "./CategoryEditor";
import {
  getPropertiesForVersion,
  getDefaultValues,
  type BitwigVersion,
  type PropertyDefinition,
} from "../data/properties";
import {
  SEMANTIC_BUNDLES,
  getBundleBaseProperty,
  type SemanticBundle,
} from "../data/properties/categories";
import { deriveColorForProperty, deriveBundleColors } from "../utils/colorUtils";
import type { Theme } from "../api/types";

interface UnifiedThemeEditorProps {
  theme: Theme;
  bitwigVersion: BitwigVersion;
  onColorChange: (key: string, value: string) => void;
  onColorsChange?: (updates: Record<string, string>) => void;
  onVersionChange?: (version: BitwigVersion) => void;
}

// Store bundle mode states
interface BundleModes {
  "knob-styling": "3d" | "flat";
  "meters-leds": "traditional" | "themed";
}

export function UnifiedThemeEditor({
  theme,
  bitwigVersion,
  onColorChange,
  onColorsChange,
  onVersionChange,
}: UnifiedThemeEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyModified, setShowOnlyModified] = useState(false);
  const [bundleModes, setBundleModes] = useState<BundleModes>({
    "knob-styling": "3d",
    "meters-leds": "traditional",
  });

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

  // Get primary accent color for use in other bundle derivations
  const primaryAccentColor = useMemo(() => {
    const accentKey = bitwigVersion === "5" ? "On" : "Accent (default)";
    return populatedValues[accentKey] || "#FF0040";
  }, [populatedValues, bitwigVersion]);

  // Group properties by bundle (category)
  const bundledProperties = useMemo(() => {
    const byBundle = new Map<string, PropertyDefinition[]>();

    for (const prop of versionProperties) {
      const existing = byBundle.get(prop.category) || [];
      existing.push(prop);
      byBundle.set(prop.category, existing);
    }

    return byBundle;
  }, [versionProperties]);

  // Filter bundles by search query
  const filteredBundles = useMemo(() => {
    if (!searchQuery && !showOnlyModified) {
      return SEMANTIC_BUNDLES.filter(bundle => bundledProperties.has(bundle.id));
    }

    const query = searchQuery.toLowerCase();
    const result: SemanticBundle[] = [];

    for (const bundle of SEMANTIC_BUNDLES) {
      const props = bundledProperties.get(bundle.id);
      if (!props) continue;

      const filteredProps = props.filter(p => {
        // Search filter
        const matchesSearch = !query ||
          p.key.toLowerCase().includes(query) ||
          (p.description?.toLowerCase().includes(query) ?? false) ||
          bundle.name.toLowerCase().includes(query);

        // Modified filter
        const isModified = showOnlyModified
          ? (populatedValues[p.key] || "").toUpperCase() !== (p.defaultValue || "").toUpperCase()
          : true;

        return matchesSearch && isModified;
      });

      if (filteredProps.length > 0) {
        result.push(bundle);
      }
    }

    return result;
  }, [searchQuery, showOnlyModified, bundledProperties, populatedValues]);

  // Get filtered properties for a bundle
  const getFilteredPropertiesForBundle = useCallback((bundleId: string): PropertyDefinition[] => {
    const props = bundledProperties.get(bundleId) || [];

    if (!searchQuery && !showOnlyModified) {
      return props;
    }

    const query = searchQuery.toLowerCase();
    const bundle = SEMANTIC_BUNDLES.find(b => b.id === bundleId);

    return props.filter(p => {
      const matchesSearch = !query ||
        p.key.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query) ?? false) ||
        (bundle?.name.toLowerCase().includes(query) ?? false);

      const isModified = showOnlyModified
        ? (populatedValues[p.key] || "").toUpperCase() !== (p.defaultValue || "").toUpperCase()
        : true;

      return matchesSearch && isModified;
    });
  }, [searchQuery, showOnlyModified, bundledProperties, populatedValues]);

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

  // Handle bundle color change - applies intelligently derived colors
  const handleBundleColorChange = useCallback((bundle: SemanticBundle, color: string) => {
    const props = bundledProperties.get(bundle.id);
    if (!props) return;

    // Try bundle-specific derivation first
    const bundleDerived = deriveBundleColors(
      bundle.id,
      bundle.derivationMode,
      color,
      {
        knobStyle: bundleModes["knob-styling"],
        meterStyle: bundleModes["meters-leds"],
        accentColor: bundle.id === "primary-accent" ? color : primaryAccentColor,
      }
    );

    // Build updates
    const updates: Record<string, string> = {};

    for (const prop of props) {
      if (bundleDerived[prop.key]) {
        // Use bundle-specific derivation
        updates[prop.key] = bundleDerived[prop.key];
      } else {
        // Fall back to property name-based derivation
        updates[prop.key] = deriveColorForProperty(color, prop.key);
      }
    }

    // Use batch update if available
    if (onColorsChange) {
      onColorsChange(updates);
    } else {
      for (const [key, value] of Object.entries(updates)) {
        onColorChange(key, value);
      }
    }
  }, [bundledProperties, bundleModes, primaryAccentColor, onColorsChange, onColorChange]);

  // Handle bundle mode change (e.g., 3D vs Flat knobs)
  const handleBundleModeChange = useCallback((bundleId: keyof BundleModes, mode: string) => {
    setBundleModes(prev => ({
      ...prev,
      [bundleId]: mode,
    }));

    // Re-derive colors with new mode
    const bundle = SEMANTIC_BUNDLES.find(b => b.id === bundleId);
    if (bundle) {
      const baseKey = getBundleBaseProperty(bundleId, bitwigVersion);
      const baseColor = populatedValues[baseKey] || "#808080";

      const newModes = {
        ...bundleModes,
        [bundleId]: mode,
      };

      const bundleDerived = deriveBundleColors(
        bundle.id,
        bundle.derivationMode,
        baseColor,
        {
          knobStyle: newModes["knob-styling"] as "3d" | "flat",
          meterStyle: newModes["meters-leds"] as "traditional" | "themed",
          accentColor: primaryAccentColor,
        }
      );

      if (Object.keys(bundleDerived).length > 0) {
        if (onColorsChange) {
          onColorsChange(bundleDerived);
        } else {
          for (const [key, value] of Object.entries(bundleDerived)) {
            onColorChange(key, value);
          }
        }
      }
    }
  }, [bitwigVersion, bundleModes, populatedValues, primaryAccentColor, onColorsChange, onColorChange]);

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
              placeholder="Search properties or bundles..."
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

      {/* Bundle List */}
      <div className="space-y-2">
        {filteredBundles.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            {searchQuery || showOnlyModified
              ? "No properties match your filters"
              : "No properties available"}
          </div>
        ) : (
          filteredBundles.map((bundle) => {
            const props = getFilteredPropertiesForBundle(bundle.id);
            const baseKey = getBundleBaseProperty(bundle.id, bitwigVersion);

            return (
              <CategoryEditor
                key={bundle.id}
                categoryName={bundle.name}
                description={bundle.description}
                properties={props}
                values={populatedValues}
                basePropertyKey={baseKey}
                onChange={onColorChange}
                onGroupColorChange={(color) => handleBundleColorChange(bundle, color)}
                defaultExpanded={false}
                modeToggle={bundle.modeToggle}
                currentMode={
                  bundle.id === "knob-styling"
                    ? bundleModes["knob-styling"]
                    : bundle.id === "meters-leds"
                    ? bundleModes["meters-leds"]
                    : undefined
                }
                onModeChange={
                  bundle.modeToggle
                    ? (mode) => handleBundleModeChange(bundle.id as keyof BundleModes, mode)
                    : undefined
                }
              />
            );
          })
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center py-2">
        Click bundle headers to expand/collapse. Use the color picker to set base colors - related properties derive automatically.
      </div>
    </div>
  );
}
