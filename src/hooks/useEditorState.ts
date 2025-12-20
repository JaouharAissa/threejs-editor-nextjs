/**
 * useEditorState Hook
 * 
 * Manages the global editor state including:
 * - Selected object
 * - Editor mode (select, translate, rotate, scale)
 * - UI settings
 * - History for undo/redo
 * 
 * This demonstrates proper state management patterns in React.
 */

'use client';

import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { EditorMode, EditorState } from '@/types/editor';

export function useEditorState() {
    const [state, setState] = useState<EditorState>({
        selectedObject: null,
        mode: EditorMode.SELECT,
        gridVisible: true,
        helpersVisible: true,
        stats: {
            geometries: 0,
            textures: 0,
        },
    });

    // Select an object
    const selectObject = useCallback((object: THREE.Object3D | null) => {
        setState(prev => ({
            ...prev,
            selectedObject: object,
        }));
    }, []);

    // Change editor mode
    const setMode = useCallback((mode: EditorMode) => {
        setState(prev => ({
            ...prev,
            mode,
        }));
    }, []);

    // Toggle grid visibility
    const toggleGrid = useCallback((visible: boolean) => {
        setState(prev => ({
            ...prev,
            gridVisible: visible,
        }));
    }, []);

    // Toggle helpers visibility
    const toggleHelpers = useCallback((visible: boolean) => {
        setState(prev => ({
            ...prev,
            helpersVisible: visible,
        }));
    }, []);

    // Update stats
    const updateStats = useCallback((stats: Partial<EditorState['stats']>) => {
        setState(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                ...stats,
            },
        }));
    }, []);

    return {
        state,
        selectObject,
        setMode,
        toggleGrid,
        toggleHelpers,
        updateStats,
    };
}
