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
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [gridVisible, setGridVisible] = useState(true);
    const gridHelperRef = useRef<THREE.GridHelper | null>(null);

    // Initialize scene on mount
    useEffect(() => {
        if (!sceneRef.current) {
            const newScene = createScene();
            sceneRef.current = newScene;
            setScene(newScene);

            // Add default lighting
            const lights = createLighting();
            lights.forEach(light => newScene.add(light));

            // Add grid helper
            const grid = createGridHelper();
            gridHelperRef.current = grid;
            newScene.add(grid);
        }

        // Cleanup on unmount
        return () => {
            if (sceneRef.current) {
                // Dispose all objects in the scene
                sceneRef.current.children.forEach(child => {
                    disposeObject(child);
                });
                sceneRef.current.clear();
                sceneRef.current = null;
                setScene(null);
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

    // Clear all user-added objects (keep lights and grid)
    const clearScene = useCallback(() => {
        if (sceneRef.current) {
            const objectsToRemove: THREE.Object3D[] = [];

            sceneRef.current.children.forEach(child => {
                // Keep lights and grid helper
                if (!(child instanceof THREE.Light) && child !== gridHelperRef.current) {
                    objectsToRemove.push(child);
                }
            });

            objectsToRemove.forEach(obj => removeObject(obj));
        }
    }, [removeObject]);

    return {
        scene,
        gridVisible,
        toggleGrid,
        addObject,
        removeObject,
        clearScene,
    };
}
