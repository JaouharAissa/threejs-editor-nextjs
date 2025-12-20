/**
 * Sidebar Component with Tabbed Interface
 * 
 * Provides a tabbed sidebar with:
 * - Scene tab: Hierarchical tree view of all scene objects
 * - Properties tab: Editable properties for selected object  
 * - Background tab: Scene background and fog settings (future)
 * 
 * Based on original editor's sidebar with multiple panels.
 * 
 * @reference editor/js/Sidebar.js - Main sidebar container
 * @reference editor/js/Sidebar.Scene.js - Scene tree panel
 * @reference editor/js/Sidebar.Properties.js - Properties panel
 */

'use client';

import { useState, useEffect, memo } from 'react';
import * as THREE from 'three';
import { SidebarProps } from '@/types/editor';
import { colorToHex, hexToColor, isMesh } from '@/utils/three-helpers';
import { SceneHierarchy } from './SceneHierarchy';

interface SidebarWithSceneProps extends SidebarProps {
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    onObjectSelect: (object: THREE.Object3D | null) => void;
}

type TabType = 'scene' | 'properties';

const Sidebar = ({
    selectedObject,
    scene,
    camera,
    onPropertyChange,
    onObjectSelect,
    className = ''
}: SidebarWithSceneProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('scene');
    const [objectName, setObjectName] = useState('');
    const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
    const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
    const [visible, setVisible] = useState(true);
    const [color, setColor] = useState('#ffffff');

    // Switch to properties tab when object is selected (disabled - allow manual control)
    // useEffect(() => {
    //     if (selectedObject && activeTab !== 'properties') {
    //         setActiveTab('properties');
    //     }
    // }, [selectedObject, activeTab]);

    // Update form values when selection changes
    useEffect(() => {
        if (selectedObject) {
            setObjectName(selectedObject.name || 'Unnamed');
            setPosition({
                x: Number(selectedObject.position.x.toFixed(2)),
                y: Number(selectedObject.position.y.toFixed(2)),
                z: Number(selectedObject.position.z.toFixed(2)),
            });
            setRotation({
                x: Number((selectedObject.rotation.x * 180 / Math.PI).toFixed(2)),
                y: Number((selectedObject.rotation.y * 180 / Math.PI).toFixed(2)),
                z: Number((selectedObject.rotation.z * 180 / Math.PI).toFixed(2)),
            });
            setScale({
                x: Number(selectedObject.scale.x.toFixed(2)),
                y: Number(selectedObject.scale.y.toFixed(2)),
                z: Number(selectedObject.scale.z.toFixed(2)),
            });
            setVisible(selectedObject.visible);

            // Get color from material if it's a mesh
            if (isMesh(selectedObject) && selectedObject.material) {
                const material = selectedObject.material as THREE.MeshStandardMaterial;
                if (material.color) {
                    setColor(colorToHex(material.color.getHex()));
                }
            }
        }
    }, [selectedObject]);

    // Handle property updates
    const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
        const numValue = parseFloat(value) || 0;
        const newPosition = { ...position, [axis]: numValue };
        setPosition(newPosition);

        if (selectedObject && onPropertyChange) {
            selectedObject.position[axis] = numValue;
            onPropertyChange(selectedObject, 'position', newPosition);
        }
    };

    const handleRotationChange = (axis: 'x' | 'y' | 'z', value: string) => {
        const numValue = parseFloat(value) || 0;
        const newRotation = { ...rotation, [axis]: numValue };
        setRotation(newRotation);

        if (selectedObject && onPropertyChange) {
            selectedObject.rotation[axis] = numValue * Math.PI / 180;
            onPropertyChange(selectedObject, 'rotation', newRotation);
        }
    };

    const handleScaleChange = (axis: 'x' | 'y' | 'z', value: string) => {
        const numValue = parseFloat(value) || 1;
        const newScale = { ...scale, [axis]: numValue };
        setScale(newScale);

        if (selectedObject && onPropertyChange) {
            selectedObject.scale[axis] = numValue;
            onPropertyChange(selectedObject, 'scale', newScale);
        }
    };

    const handleNameChange = (value: string) => {
        setObjectName(value);
        if (selectedObject && onPropertyChange) {
            selectedObject.name = value;
            onPropertyChange(selectedObject, 'name', value);
        }
    };

    const handleVisibilityChange = (value: boolean) => {
        setVisible(value);
        if (selectedObject && onPropertyChange) {
            selectedObject.visible = value;
            onPropertyChange(selectedObject, 'visible', value);
        }
    };

    const handleColorChange = (value: string) => {
        setColor(value);
        if (selectedObject && onPropertyChange && isMesh(selectedObject)) {
            const material = selectedObject.material as THREE.MeshStandardMaterial;
            if (material.color) {
                material.color.setHex(hexToColor(value));
                onPropertyChange(selectedObject, 'color', value);
            }
        }
    };

    return (
        <div className={`w-80 bg-neutral-800 border-l border-neutral-700 flex flex-col ${className}`}>
            {/* Tab Navigation */}
            <div className="flex border-b border-neutral-700 bg-neutral-900">
                <button
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'scene'
                        ? 'text-white bg-neutral-800 border-b-2 border-b-blue-500'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                        }`}
                    onClick={() => setActiveTab('scene')}
                >
                    Scene
                </button>
                <button
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'properties'
                        ? 'text-white bg-neutral-800 border-b-2 border-b-blue-500'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                        }`}
                    onClick={() => setActiveTab('properties')}
                >
                    Properties
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {/* Scene Tab */}
                {activeTab === 'scene' && (
                    <SceneHierarchy
                        scene={scene}
                        camera={camera}
                        selectedObject={selectedObject}
                        onSelectObject={onObjectSelect}
                    />
                )}

                {/* Properties Tab */}
                {activeTab === 'properties' && (
                    <div className="h-full overflow-y-auto p-4">
                        {!selectedObject ? (
                            <p className="text-neutral-400 text-sm">No object selected</p>
                        ) : (
                            <>
                                <h2 className="text-white text-lg font-semibold mb-4">Properties</h2>

                                {/* Object Name */}
                                <div className="mb-6">
                                    <label className="block text-neutral-300 text-sm font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={objectName}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        className="w-full bg-neutral-700 border border-neutral-600 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Visibility */}
                                <div className="mb-6">
                                    <label className="flex items-center text-neutral-300 text-sm font-medium">
                                        <input
                                            type="checkbox"
                                            checked={visible}
                                            onChange={(e) => handleVisibilityChange(e.target.checked)}
                                            className="mr-2"
                                        />
                                        Visible
                                    </label>
                                </div>

                                {/* Position */}
                                <div className="mb-6">
                                    <h3 className="text-neutral-300 text-sm font-medium mb-2">Position</h3>
                                    <div className="space-y-2">
                                        {(['x', 'y', 'z'] as const).map((axis) => (
                                            <div key={axis} className="flex items-center">
                                                <label className="w-8 text-neutral-400 text-sm uppercase">{axis}</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={position[axis]}
                                                    onChange={(e) => handlePositionChange(axis, e.target.value)}
                                                    className="flex-1 bg-neutral-700 border border-neutral-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rotation */}
                                <div className="mb-6">
                                    <h3 className="text-neutral-300 text-sm font-medium mb-2">Rotation (degrees)</h3>
                                    <div className="space-y-2">
                                        {(['x', 'y', 'z'] as const).map((axis) => (
                                            <div key={axis} className="flex items-center">
                                                <label className="w-8 text-neutral-400 text-sm uppercase">{axis}</label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={rotation[axis]}
                                                    onChange={(e) => handleRotationChange(axis, e.target.value)}
                                                    className="flex-1 bg-neutral-700 border border-neutral-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Scale */}
                                <div className="mb-6">
                                    <h3 className="text-neutral-300 text-sm font-medium mb-2">Scale</h3>
                                    <div className="space-y-2">
                                        {(['x', 'y', 'z'] as const).map((axis) => (
                                            <div key={axis} className="flex items-center">
                                                <label className="w-8 text-neutral-400 text-sm uppercase">{axis}</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={scale[axis]}
                                                    onChange={(e) => handleScaleChange(axis, e.target.value)}
                                                    className="flex-1 bg-neutral-700 border border-neutral-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Color (for meshes only) */}
                                {isMesh(selectedObject) && (
                                    <div className="mb-6">
                                        <h3 className="text-neutral-300 text-sm font-medium mb-2">Color</h3>
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => handleColorChange(e.target.value)}
                                            className="w-full h-10 bg-neutral-700 border border-neutral-600 rounded cursor-pointer"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(Sidebar);
