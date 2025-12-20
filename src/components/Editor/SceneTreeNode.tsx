/**
 * Scene Hierarchy Tree Node Component
 * 
 * Recursive component that renders a single node in the scene tree.
 * Based on original editor's Sidebar.Scene.js outliner implementation.
 * 
 * Features:
 * - Recursive rendering of object children
 * - Click to select objects
 * - Visual type indicators (icons)  
 * - Expand/collapse for groups
 * - Indentation based on depth
 * - Visibility toggle
 * 
 * @reference editor/js/Sidebar.Scene.js - buildOption(), buildHTML()
 */

'use client';

import React, { useState, useCallback } from 'react';
import * as THREE from 'three';
import {
    Box,
    Cylinder,
    Circle,
    Lightbulb,
    Camera,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    Layers,
    Shapes,
} from 'lucide-react';

interface SceneTreeNodeProps {
    object: THREE.Object3D;
    depth: number;
    isSelected: boolean;
    onSelect: (object: THREE.Object3D) => void;
    onToggleExpanded?: (object: THREE.Object3D, expanded: boolean) => void;
    expanded?: boolean;
}

/**
 * Get icon component for different Three.js object types
 * Based on original's getObjectType() function
 */
function getObjectIcon(object: THREE.Object3D) {
    if (object.type === 'Scene') return Layers;
    if ((object as THREE.Camera).isCamera) return Camera;
    if ((object as THREE.Light).isLight) return Lightbulb;
    if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry.type === 'BoxGeometry') return Box;
        if (mesh.geometry.type === 'SphereGeometry') return Circle;
        if (mesh.geometry.type === 'CylinderGeometry') return Cylinder;
        return Shapes;
    }
    if ((object as THREE.Line).isLine) return Shapes;
    if ((object as THREE.Points).isPoints) return Circle;
    if (object.type === 'Group') return Layers;

    return Shapes; // Default for Object3D
}

/**
 * Get display name for object based on type
 * Fallback to "Unnamed {Type}" if no name set
 */
function getDisplayName(object: THREE.Object3D): string {
    if (object.name && object.name.trim() !== '') {
        return object.name;
    }

    // Generate default name based on type
    if (object.type === 'Scene') return 'Scene';
    if ((object as THREE.Camera).isCamera) return 'Unnamed Camera';
    if ((object as THREE.Light).isLight) return `Unnamed ${object.type}`;
    if ((object as THREE.Mesh).isMesh) return 'Unnamed Mesh';
    if (object.type === 'Group') return 'Unnamed Group';

    return `Unnamed ${object.type}`;
}

/**
 * SceneTreeNode - Renders a single node in the scene hierarchy
 * 
 * Handles:
 * - Visual representation with icon and name
 * - Selection state highlighting
 * - Expand/collapse for nodes with children
 * - Visibility toggle
 * - Recursive rendering of children
 */
export const SceneTreeNode: React.FC<SceneTreeNodeProps> = ({
    object,
    depth,
    isSelected,
    onSelect,
    onToggleExpanded,
    expanded = true,
}) => {
    const [isVisible, setIsVisible] = useState(object.visible);
    const hasChildren = object.children.length > 0;

    /**
     * Handle node selection
     * Prevents event bubbling to avoid selecting parent nodes
     */
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(object);
    }, [object, onSelect]);

    /**
     * Handle expand/collapse toggle
     * Original uses WeakMap to store node states
     */
    const handleToggleExpand = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren && onToggleExpanded) {
            onToggleExpanded(object, !expanded);
        }
    }, [hasChildren, expanded, object, onToggleExpanded]);

    /**
     * Handle visibility toggle
     * Directly modifies Three.js object visibility
     */
    const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const newVisibility = !isVisible;
        object.visible = newVisibility;
        setIsVisible(newVisibility);
    }, [object, isVisible]);

    const Icon = getObjectIcon(object);
    const displayName = getDisplayName(object);
    const indentPx = depth * 18; // Same as original: option.style.paddingLeft = ( pad * 18 ) + 'px'

    return (
        <>
            <div
                className={`
          flex items-center gap-2 px-2 py-1.5 cursor-pointer
          hover:bg-neutral-700/50 transition-colors
          ${isSelected ? 'bg-blue-600/30 border-l-2 border-l-blue-500' : ''}
          text-sm
        `}
                style={{ paddingLeft: `${indentPx + 8}px` }}
                onClick={handleClick}
            >
                {/* Expand/Collapse Button */}
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {hasChildren ? (
                        <button
                            onClick={handleToggleExpand}
                            className="text-neutral-400 hover:text-white transition-colors"
                            aria-label={expanded ? 'Collapse' : 'Expand'}
                        >
                            {expanded ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : (
                                <ChevronRight className="w-3 h-3" />
                            )}
                        </button>
                    ) : (
                        <div className="w-3 h-3" /> // Spacer for alignment
                    )}
                </div>

                {/* Object Type Icon */}
                <Icon className="w-4 h-4 text-neutral-400 flex-shrink-0" />

                {/* Object Name */}
                <span className="flex-1 truncate text-neutral-200">
                    {displayName}
                </span>

                {/* Visibility Toggle */}
                <button
                    onClick={handleToggleVisibility}
                    className="text-neutral-400 hover:text-white transition-colors flex-shrink-0"
                    aria-label={isVisible ? 'Hide object' : 'Show object'}
                >
                    {isVisible ? (
                        <Eye className="w-4 h-4" />
                    ) : (
                        <EyeOff className="w-4 h-4 opacity-50" />
                    )}
                </button>
            </div>

            {/* Render Children Recursively (if expanded) */}
            {hasChildren && expanded && (
                <div>
                    {object.children.map((child) => (
                        <SceneTreeNode
                            key={child.uuid}
                            object={child}
                            depth={depth + 1}
                            isSelected={false} // Child selection handled by parent
                            onSelect={onSelect}
                            onToggleExpanded={onToggleExpanded}
                            expanded={true} // Could track per-child if needed
                        />
                    ))}
                </div>
            )}
        </>
    );
};
