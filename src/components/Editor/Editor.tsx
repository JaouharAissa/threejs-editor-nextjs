/**
 * Main Editor Component - Orchestrates all editor functionality
 */

'use client';

import { useCallback, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '@/hooks/useThreeScene';
import { useRenderer } from '@/hooks/useRenderer';
import { useEditorState } from '@/hooks/useEditorState';
import { createCamera, createObject, createLight } from '@/utils/three-helpers';
import { ObjectType } from '@/types/editor';
import Viewport from './Viewport';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import MenuBar from './MenuBar';

export default function Editor() {
    const { scene, gridVisible, toggleGrid, addObject, removeObject, clearScene } = useThreeScene();
    const { state, selectObject, setMode } = useEditorState();
    const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
    const [transformSpace, setTransformSpace] = useState<'local' | 'world'>('world');
    const [, forceUpdate] = useState({});

    // Initialize camera on mount (client-side only)
    useEffect(() => {
        setCamera(createCamera(window.innerWidth / window.innerHeight));
    }, []);

    const { initRenderer, render, rendererRef } = useRenderer({ camera });

    // Handle menu actions
    const handleMenuAction = useCallback((action: string) => {
        const [category, command] = action.split(':');

        switch (category) {
            case 'file':
                handleFileAction(command);
                break;
            case 'add':
                handleAddObject(command);
                break;
            case 'view':
                handleViewAction(command);
                break;
            case 'edit':
                handleEditAction(command);
                break;
        }
    }, [scene, camera, state, gridVisible, rendererRef]);

    const handleFileAction = (command: string) => {
        switch (command) {
            case 'new':
                if (confirm('Clear the current scene?')) {
                    clearScene();
                    selectObject(null);
                }
                break;
            case 'export':
                try {
                    if (scene) {
                        const sceneData = scene.toJSON();
                        const dataStr = JSON.stringify(sceneData, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'scene.json';
                        link.click();
                        URL.revokeObjectURL(url);
                    }
                } catch (error) {
                    console.error('Export failed:', error);
                    alert('Failed to export scene. See console for details.');
                }
                break;
            case 'screenshot':
                if (rendererRef.current && scene && camera) {
                    try {
                        rendererRef.current.render(scene, camera);
                        const url = rendererRef.current.domElement.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } catch (e) {
                        console.error(e);
                        alert('Screenshot failed: ' + e);
                    }
                } else {
                    alert('Renderer not ready');
                }
                break;
            case 'import':
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            try {
                                const json = JSON.parse(event.target?.result as string);
                                const loader = new THREE.ObjectLoader();
                                const loadedScene = loader.parse(json);
                                console.log('Scene loaded:', loadedScene);
                            } catch (error) {
                                alert('Error loading scene: ' + error);
                            }
                        };
                        reader.readAsText(file);
                    }
                };
                input.click();
                break;
        }
    };

    const handleAddObject = (type: string) => {
        let object: THREE.Object3D;

        const objectTypeMap: Record<string, ObjectType> = {
            box: ObjectType.BOX,
            sphere: ObjectType.SPHERE,
            cylinder: ObjectType.CYLINDER,
            plane: ObjectType.PLANE,
            torus: ObjectType.TORUS,
            cone: ObjectType.CONE,
            torusKnot: ObjectType.TORUS_KNOT,
            dodecahedron: ObjectType.DODECAHEDRON,
            icosahedron: ObjectType.ICOSAHEDRON,
            octahedron: ObjectType.OCTAHEDRON,
            pointLight: ObjectType.LIGHT_POINT,
            directionalLight: ObjectType.LIGHT_DIRECTIONAL,
            ambientLight: ObjectType.LIGHT_AMBIENT,
        };

        const objectType = objectTypeMap[type];

        if (type.includes('Light')) {
            object = createLight(objectType);
        } else {
            object = createObject(objectType);
        }

        addObject(object);
        selectObject(object);
    };

    const handleViewAction = (command: string) => {
        switch (command) {
            case 'toggleGrid':
                toggleGrid(!gridVisible);
                break;
            case 'toggleHelpers':
                console.log('Toggle helpers');
                break;
        }
    };

    const handleEditAction = (command: string) => {
        switch (command) {
            case 'delete':
                if (state.selectedObject) {
                    removeObject(state.selectedObject);
                    selectObject(null);
                }
                break;
            case 'clear':
                if (confirm('Clear all objects from the scene?')) {
                    clearScene();
                    selectObject(null);
                }
                break;
        }
    };

    const handleRender = useCallback((sceneToRender: THREE.Scene) => {
        render(sceneToRender);
    }, [render]);

    const handlePropertyChange = useCallback(
        (object: THREE.Object3D, property: string, value: unknown) => {
            console.log(`Property changed: ${property}`, value);
        },
        []
    );

    const handleTransformChange = useCallback(() => {
        // Force re-render to update sidebar values
        forceUpdate({});
    }, []);

    return (
        <div className="flex flex-col h-screen w-screen bg-neutral-900 text-white">
            <MenuBar onAction={handleMenuAction} />
            <Toolbar
                mode={state.mode}
                onModeChange={setMode}
                transformSpace={transformSpace}
                onTransformSpaceChange={setTransformSpace}
            />
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1">
                    <Viewport
                        scene={scene}
                        camera={camera}
                        onInitRenderer={initRenderer}
                        onRender={handleRender}
                        selectedObject={state.selectedObject}
                        mode={state.mode}
                        transformSpace={transformSpace}
                        onObjectSelect={selectObject}
                        onTransformChange={handleTransformChange}
                    />
                </div>
                <Sidebar
                    selectedObject={state.selectedObject}
                    scene={scene}
                    camera={camera}
                    onPropertyChange={handlePropertyChange}
                    onObjectSelect={selectObject}
                />
            </div>
        </div>
    );
}
