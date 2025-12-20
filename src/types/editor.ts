/**
 * TypeScript type definitions for the Three.js Editor
 * 
 * This file contains all custom types and interfaces used throughout the editor.
 * We use strict typing to avoid 'any' types and ensure type safety.
 */

import * as THREE from 'three';

/**
 * Represents the different editing mode states
 */
export enum EditorMode {
    SELECT = 'select',
    TRANSLATE = 'translate',
    ROTATE = 'rotate',
    SCALE = 'scale',
}

/**
 * Represents the type of objects that can be added to the scene
 */
export enum ObjectType {
    BOX = 'box',
    SPHERE = 'sphere',
    CYLINDER = 'cylinder',
    PLANE = 'plane',
    TORUS = 'torus',
    CONE = 'cone',
    TORUS_KNOT = 'torusKnot',
    DODECAHEDRON = 'dodecahedron',
    ICOSAHEDRON = 'icosahedron',
    OCTAHEDRON = 'octahedron',
    LIGHT_POINT = 'pointLight',
    LIGHT_DIRECTIONAL = 'directionalLight',
    LIGHT_AMBIENT = 'ambientLight',
    CAMERA_PERSPECTIVE = 'perspectiveCamera',
}

/**
 * Represents a history state for undo/redo functionality
 */
export interface HistoryState {
    id: string;
    timestamp: number;
    action: string;
    data: Record<string, unknown>;
}

/**
 * Represents the editor's current state
 */
export interface EditorState {
    selectedObject: THREE.Object3D | null;
    mode: EditorMode;
    gridVisible: boolean;
    helpersVisible: boolean;
    stats: {
        geometries: number;
        textures: number;
    };
}

/**
 * Configuration for the viewport renderer
 */
export interface ViewportConfig {
    antialias: boolean;
    alpha: boolean;
    shadowsEnabled: boolean;
    toneMapping: THREE.ToneMapping;
    toneMappingExposure: number;
}

/**
 * Props for editor components
 */
export interface EditorProps {
    className?: string;
}

export interface ViewportProps extends EditorProps {
    onObjectSelect?: (object: THREE.Object3D | null) => void;
}

export interface SidebarProps extends EditorProps {
    selectedObject: THREE.Object3D | null;
    onPropertyChange?: (object: THREE.Object3D, property: string, value: unknown) => void;
}

export interface ToolbarProps extends EditorProps {
    mode: EditorMode;
    onModeChange: (mode: EditorMode) => void;
}

export interface MenuBarProps extends EditorProps {
    onAction: (action: string) => void;
}

/**
 * Represents object properties that can be edited
 */
export interface ObjectProperties {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    visible: boolean;
    castShadow: boolean;
    receiveShadow: boolean;
}

/**
 * Represents material properties
 */
export interface MaterialProperties {
    color: string;
    roughness?: number;
    metalness?: number;
    opacity: number;
    transparent: boolean;
}
