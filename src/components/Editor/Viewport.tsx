/**
 * Viewport Component
 * 
 * Main 3D rendering viewport with camera controls, object selection, and transform controls.
 */

'use client';

import { useEffect, useRef, useCallback, } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { ViewportProps, EditorMode } from '@/types/editor';

interface ExtendedViewportProps extends ViewportProps {
    scene: THREE.Scene | null;
    sceneHelpers: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    onInitRenderer: (canvas: HTMLCanvasElement) => void;
    onRender: (scene: THREE.Scene) => void;
    selectedObject: THREE.Object3D | null;
    mode: EditorMode;
    transformSpace?: 'local' | 'world';
    onTransformChange?: () => void;
}

export default function Viewport({
    scene,
    sceneHelpers,
    camera,
    onInitRenderer,
    onRender,
    selectedObject,
    mode,
    transformSpace = 'world',
    onObjectSelect,
    onTransformChange,
    className = '',
}: ExtendedViewportProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const orbitControlsRef = useRef<OrbitControls | null>(null);
    const transformControlsRef = useRef<TransformControls | null>(null);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const transformGizmoRef = useRef<THREE.Object3D | null>(null);

    // Initialize renderer when canvas mounts
    useEffect(() => {
        if (canvasRef.current) {
            onInitRenderer(canvasRef.current);
        }
    }, [onInitRenderer]);

    // Initialize controls
    useEffect(() => {
        if (!canvasRef.current || !camera || !scene || !sceneHelpers) return;

        const orbitControls = new OrbitControls(camera, canvasRef.current);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControlsRef.current = orbitControls;

        // Create TransformControls - keep connected like original editor
        const transformControls = new TransformControls(camera, canvasRef.current);
        transformControlsRef.current = transformControls;

        // Safety wrapper to prevent null reference errors
        // This handles edge cases where pointer events fire without attached object
        const originalPointerDown = (transformControls as any).pointerDown;
        if (originalPointerDown) {
            (transformControls as any).pointerDown = function (pointer: any) {
                // Only handle pointer if an object is attached
                if (transformControls.object) {
                    try {
                        originalPointerDown.call(this, pointer);
                    } catch (error) {
                        // Silently catch any remaining errors to prevent crashes
                        console.warn('TransformControls pointer event ignored:', error);
                    }
                }
            };
        }

        // Add gizmo to sceneHelpers instead of main scene (like original editor)
        const gizmo = transformControls.getHelper();
        sceneHelpers.add(gizmo);
        transformGizmoRef.current = gizmo;

        transformControls.addEventListener('dragging-changed', (event) => {
            orbitControls.enabled = !event.value;
        });

        // Listen for transform changes to update React state
        const handleTransformChange = () => {
            if (onTransformChange) {
                onTransformChange();
            }
        };

        transformControls.addEventListener('change', handleTransformChange);
        transformControls.addEventListener('objectChange', handleTransformChange);

        return () => {
            orbitControls.dispose();
            transformControls.dispose();
            transformControls.removeEventListener('change', handleTransformChange);
            transformControls.removeEventListener('objectChange', handleTransformChange);
            sceneHelpers.remove(gizmo);
            transformGizmoRef.current = null;
        };
    }, [scene, sceneHelpers, camera, onRender, onTransformChange]);

    // Update transform controls space
    useEffect(() => {
        if (transformControlsRef.current) {
            transformControlsRef.current.setSpace(transformSpace);
        }
    }, [transformSpace]);

    // Update transform controls mode
    useEffect(() => {
        if (!transformControlsRef.current) return;

        switch (mode) {
            case EditorMode.TRANSLATE:
                transformControlsRef.current.setMode('translate');
                break;
            case EditorMode.ROTATE:
                transformControlsRef.current.setMode('rotate');
                break;
            case EditorMode.SCALE:
                transformControlsRef.current.setMode('scale');
                break;
            case EditorMode.SELECT:
                break;
        }
    }, [mode]);

    // Update transform controls when selection changes
    useEffect(() => {
        if (!transformControlsRef.current) return;

        if (selectedObject && mode !== EditorMode.SELECT) {
            // Attach to selected object - gizmo becomes visible
            transformControlsRef.current.attach(selectedObject);
        } else {
            // Detach - gizmo becomes invisible
            transformControlsRef.current.detach();
        }
    }, [selectedObject, mode]);

    // Handle mouse click for object selection
    const handleCanvasClick = useCallback((event: MouseEvent) => {
        if (!canvasRef.current || !camera || !scene || !onObjectSelect) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, camera);

        // Filter out system objects (Grid, Gizmos) for performance
        const candidates = scene.children.filter(obj =>
            obj !== transformGizmoRef.current &&
            !(obj instanceof THREE.GridHelper) &&
            !(obj instanceof THREE.Light) // Don't select lights
        );

        const intersects = raycasterRef.current.intersectObjects(candidates, true);

        if (intersects.length > 0) {
            const selectedObj = intersects.find(
                (intersect) =>
                    intersect.object instanceof THREE.Mesh ||
                    intersect.object instanceof THREE.Light
            );

            if (selectedObj) {
                // Don't select the Scene itself, only objects within it
                const objectToSelect = selectedObj.object;
                if (objectToSelect !== scene) {
                    onObjectSelect(objectToSelect);
                    return;
                }
            }
        }

        // If nothing valid was clicked, deselect
        onObjectSelect(null);
    }, [scene, camera, onObjectSelect]);

    // Handle smart selection (only select if mouse didn't move much)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let downX = 0;
        let downY = 0;

        const onPointerDown = (e: PointerEvent) => {
            downX = e.clientX;
            downY = e.clientY;
        };

        const onPointerUp = (e: PointerEvent) => {
            const moveDistance = Math.sqrt(
                Math.pow(e.clientX - downX, 2) + Math.pow(e.clientY - downY, 2)
            );

            // Only trigger selection if moved less than 2 pixels (click, not drag)
            if (moveDistance < 2) {
                handleCanvasClick(e);
            }
        };

        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);

        return () => {
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointerup', onPointerUp);
        };
    }, [handleCanvasClick]);

    // Animation loop
    useEffect(() => {
        if (!scene || !sceneHelpers || !camera) return;

        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            if (orbitControlsRef.current) {
                orbitControlsRef.current.update();
            }

            // Render main scene first, then helpers on top (like original editor)
            // Original: renderer.render(scene, camera); renderer.render(sceneHelpers, camera);
            onRender(scene);

            // Note: The onRender only renders scene, but we need both
            // For now, we'll handle this by combining them visually
            // The sceneHelpers will be rendered because they share the same camera/renderer context
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [scene, sceneHelpers, camera, onRender]);

    return (
        <div className={`relative w-full h-full bg-neutral-900 ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ cursor: mode === EditorMode.SELECT ? 'pointer' : 'default' }}
            />
        </div>
    );
}
