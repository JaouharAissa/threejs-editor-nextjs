/**
 * useAnimationLoop Hook
 * 
 * Manages the requestAnimationFrame loop with proper cleanup.
 * This hook demonstrates:
 * - Proper RAF lifecycle management
 * - Automatic cleanup to prevent memory leaks
 * - Pausing/resuming the loop
 * 
 * CRITICAL: The original editor often forgets to cancel RAF on unmount,
 * leading to performance issues and potential crashes.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseAnimationLoopProps {
    onFrame: (deltaTime: number) => void;
    enabled?: boolean;
}

export function useAnimationLoop({ onFrame, enabled = true }: UseAnimationLoopProps) {
    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number>(0);
    const isRunningRef = useRef(false);

    // Animation loop function
    const animate = useCallback((time: number) => {
        if (previousTimeRef.current === 0) {
            previousTimeRef.current = time;
        }

        const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds
        previousTimeRef.current = time;

        // Call the frame callback
        onFrame(deltaTime);

        // Schedule next frame if still enabled
        if (isRunningRef.current) {
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [onFrame]);

    // Start the animation loop
    const start = useCallback(() => {
        if (!isRunningRef.current) {
            isRunningRef.current = true;
            previousTimeRef.current = 0; // Reset time
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [animate]);

    // Stop the animation loop
    const stop = useCallback(() => {
        isRunningRef.current = false;
        if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
    }, []);

    // Start/stop based on enabled prop
    useEffect(() => {
        if (enabled) {
            start();
        } else {
            stop();
        }
    }, [enabled, start, stop]);

    // Cleanup on unmount - CRITICAL for preventing memory leaks
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        start,
        stop,
        isRunning: isRunningRef.current,
    };
}
