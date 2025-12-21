/**
 * useThreeScene Hook
 * 
 * Manages the Three.js scene lifecycle including creation, cleanup, and updates.
 * This hook demonstrates proper React patterns for managing external resources.
 * 
 * Key features:
 * - Proper initialization and cleanup
 * - Memoized scene to prevent unnecessary recreations
 * - Type-safe object management
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createScene, createGridHelper, createLighting, disposeObject } from '@/utils/three-helpers';

export function useThreeScene() {
    const sceneRef = useRef<THREE.Scene | null>(null);
    const sceneHelpersRef = useRef<THREE.Scene | null>(null);
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [sceneHelpers, setSceneHelpers] = useState<THREE.Scene | null>(null);
    const [gridVisible, setGridVisible] = useState(true);
    const gridHelperRef = useRef<THREE.GridHelper | null>(null);

    // Initialize scene and sceneHelpers on mount
    useEffect(() => {
        if (!sceneRef.current) {
            // Main scene for user objects
            const newScene = createScene();
            sceneRef.current = newScene;
            setScene(newScene);

            // Helpers scene for UI helpers (like original editor)
            // Only visual helpers go here (grid, gizmos), NOT lights
            const newSceneHelpers = new THREE.Scene();
            sceneHelpersRef.current = newSceneHelpers;
            setSceneHelpers(newSceneHelpers);

            // IMPORTANT: Lights must be in main scene to illuminate user objects
            // In Three.js, lights only affect objects in the same scene
            const lights = createLighting();
            lights.forEach(light => newScene.add(light));

            // Add grid helper to helpers scene (visual only, doesn't need to be pickable)
            const grid = createGridHelper();
            gridHelperRef.current = grid;
            newSceneHelpers.add(grid);
        }

        // Cleanup on unmount
        return () => {
            if (sceneRef.current) {
                // Dispose all objects in the main scene
                sceneRef.current.children.forEach(child => {
                    disposeObject(child);
                });
                sceneRef.current.clear();
                sceneRef.current = null;
                setScene(null);
            }

            if (sceneHelpersRef.current) {
                // Dispose all objects in the helpers scene
                sceneHelpersRef.current.children.forEach(child => {
                    disposeObject(child);
                });
                sceneHelpersRef.current.clear();
                sceneHelpersRef.current = null;
                setSceneHelpers(null);
            }
        };
    }, []);

    // Toggle grid visibility
    const toggleGrid = useCallback((visible: boolean) => {
        if (gridHelperRef.current) {
            gridHelperRef.current.visible = visible;
            setGridVisible(visible);
        }
    }, []);

    // Add object to scene
    const addObject = useCallback((object: THREE.Object3D) => {
        if (sceneRef.current) {
            sceneRef.current.add(object);
        }
    }, []);

    // Remove object from scene
    const removeObject = useCallback((object: THREE.Object3D) => {
        if (sceneRef.current) {
            sceneRef.current.remove(object);
            disposeObject(object);
        }
    }, []);

    // Clear all user-added objects (keep lights)
    // Grid is in sceneHelpers, but lights are in main scene (needed for illumination)
    const clearScene = useCallback(() => {
        if (sceneRef.current) {
            const objectsToRemove: THREE.Object3D[] = [];

            sceneRef.current.children.forEach(child => {
                // Keep lights (they illuminate the scene)
                if (!(child instanceof THREE.Light)) {
                    objectsToRemove.push(child);
                }
            });

            objectsToRemove.forEach(obj => removeObject(obj));
        }
    }, [removeObject]);

    return {
        scene,
        sceneHelpers,
        gridVisible,
        toggleGrid,
        addObject,
        removeObject,
        clearScene,
    };
}
