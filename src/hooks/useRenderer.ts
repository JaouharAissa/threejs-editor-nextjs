/**
 * useRenderer Hook
 * 
 * Manages the WebGL renderer lifecycle with proper cleanup and resize handling.
 * This hook demonstrates:
 * - Proper renderer initialization and disposal
 * - Automatic canvas resizing with ResizeObserver
 * - Memory leak prevention
 * 
 * ISSUE #1 FIX: The original editor doesn't properly dispose of the renderer,
 * leading to WebGL context leaks. This hook ensures proper cleanup.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { createRenderer, disposeRenderer, handleResize } from '@/utils/three-helpers';

interface UseRendererProps {
    camera: THREE.PerspectiveCamera | null;
}

export function useRenderer({ camera }: UseRendererProps) {
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Initialize renderer when canvas is available
    const initRenderer = useCallback((canvas: HTMLCanvasElement) => {
        if (!rendererRef.current) {
            canvasRef.current = canvas;
            const renderer = createRenderer(canvas);
            rendererRef.current = renderer;

            // Set initial size
            const rect = canvas.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height);

            // Setup resize observer for automatic resizing
            // ISSUE #2 FIX: Original editor uses window resize events which don't
            // account for container size changes. ResizeObserver is more robust.
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;

                    if (camera && rendererRef.current) {
                        handleResize(camera, rendererRef.current, width, height);
                    }
                }
            });

            resizeObserver.observe(canvas);
            resizeObserverRef.current = resizeObserver;
        }
    }, [camera]);

    // Render a frame
    const render = useCallback((scene: THREE.Scene) => {
        if (rendererRef.current && camera) {
            rendererRef.current.render(scene, camera);
        }
    }, [camera]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Disconnect resize observer
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }

            // Dispose renderer properly to prevent memory leaks
            if (rendererRef.current) {
                disposeRenderer(rendererRef.current);
                rendererRef.current = null;
            }

            canvasRef.current = null;
        };
    }, []);

    return {
        rendererRef,
        initRenderer,
        render,
    };
}
