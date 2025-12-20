/**
 * Scene Hierarchy Component
 * 
 * Main container for the scene tree/outliner view.
 * Based on original editor's Sidebar.Scene.js outliner section.
 * 
 * Displays all objects in the scene as a hierarchical tree with:
 * - Camera (always shown at top)
 * - Scene (with all children)
 * - Recursive nesting for groups
 * - Selection synchronization with viewport
 * - Expand/collapse state management
 * 
 * @reference editor/js/Sidebar.Scene.js - outliner, refreshUI()
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import * as THREE from 'three';
import { SceneTreeNode } from './SceneTreeNode';

interface SceneHierarchyProps {
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    selectedObject: THREE.Object3D | null;
    onSelectObject: (object: THREE.Object3D | null) => void;
}

/**
 * SceneHierarchy - The main outliner/tree view component
 * 
 * Manages:
 * - Tree structure of all scene objects
 * - Expand/collapse states (using Map instead of WeakMap for React state)
 * - Selection highlighting
 * - Camera display at top
 * 
 * Original editor uses WeakMap for node states and rebuilds HTML on every change.
 * This React version uses proper state management and re-renders efficiently.
 */
const SceneHierarchyComponent: React.FC<SceneHierarchyProps> = ({
    scene,
    camera,
    selectedObject,
    onSelectObject,
}) => {
    // Track which nodes are expanded
    // Key is object.uuid, value is whether it's expanded
    const [expandedNodes, setExpandedNodes] = useState<Map<string, boolean>>(new Map());

    /**
     * Initialize expand state for the scene
     * Original: nodeStates.set(object, false) for all objects
     */
    useEffect(() => {
        if (scene) {
            const newExpanded = new Map<string, boolean>();

            // Set scene as expanded by default
            newExpanded.set(scene.uuid, true);

            // Traverse and set default states
            scene.traverse((object) => {
                if (object.children.length > 0) {
                    // Default to collapsed, will auto-expand to show selected object
                    newExpanded.set(object.uuid, false);
                }
            });

            setExpandedNodes(newExpanded);
        }
    }, [scene]);

    /**
     * Auto-expand parent nodes when an object is selected
     * This ensures the selected object is visible in the tree
     * 
     * Original does this in objectSelected signal handler
     */
    useEffect(() => {
        if (selectedObject && scene) {
            const newExpanded = new Map(expandedNodes);
            let needsUpdate = false;

            // Expand all parents of selected object
            let parent = selectedObject.parent;
            while (parent && parent !== scene.parent) {
                if (!newExpanded.get(parent.uuid)) {
                    newExpanded.set(parent.uuid, true);
                    needsUpdate = true;
                }
                parent = parent.parent;
            }

            if (needsUpdate) {
                setExpandedNodes(newExpanded);
            }
        }
    }, [selectedObject, scene, expandedNodes]);

    /**
     * Handle node expand/collapse toggle
     * Original: nodeStates.set(object, !nodeStates.get(object))
     */
    const handleToggleExpanded = useCallback((object: THREE.Object3D, expanded: boolean) => {
        setExpandedNodes((prev) => {
            const next = new Map(prev);
            next.set(object.uuid, expanded);
            return next;
        });
    }, []);

    /**
     * Handle object selection from tree
     * Original: editor.selectById(parseInt(outliner.getValue()))
     */
    const handleSelect = useCallback((object: THREE.Object3D) => {
        onSelectObject(object);
    }, [onSelectObject]);

    /**
     * Check if a node should be expanded
     */
    const isExpanded = useCallback((object: THREE.Object3D): boolean => {
        return expandedNodes.get(object.uuid) ?? false;
    }, [expandedNodes]);

    /**
     * Memoize whether an object is selected
     */
    const isObjectSelected = useCallback((object: THREE.Object3D): boolean => {
        return selectedObject?.uuid === object.uuid;
    }, [selectedObject]);

    if (!scene) {
        return (
            <div className="p-4 text-center text-neutral-500 text-sm">
                No scene loaded
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-3 py-2 border-b border-neutral-700 bg-neutral-800/50">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Scene
                </h3>
            </div>

            {/* Tree View - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {/* Camera - Always shown at top (like original) */}
                {camera && (
                    <SceneTreeNode
                        object={camera}
                        depth={0}
                        isSelected={isObjectSelected(camera)}
                        onSelect={handleSelect}
                        onToggleExpanded={handleToggleExpanded}
                        expanded={isExpanded(camera)}
                    />
                )}

                {/* Scene and all its children */}
                <SceneTreeNode
                    object={scene}
                    depth={0}
                    isSelected={isObjectSelected(scene)}
                    onSelect={handleSelect}
                    onToggleExpanded={handleToggleExpanded}
                    expanded={isExpanded(scene)}
                />
            </div>

            {/* Footer - Object count */}
            <div className="px-3 py-2 border-t border-neutral-700 bg-neutral-800/50 text-xs text-neutral-500">
                {scene.children.length} object{scene.children.length !== 1 ? 's' : ''} in scene
            </div>
        </div>
    );
};

export const SceneHierarchy = memo(SceneHierarchyComponent);;
