/**
 * Utility functions for Three.js operations
 * 
 * These helpers encapsulate common Three.js operations and provide
 * proper resource cleanup to prevent memory leaks.
 */

import * as THREE from 'three';
import { ObjectType } from '@/types/editor';

/**
 * Creates a basic scene with default settings
 */
export function createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    scene.fog = new THREE.Fog(0x222222, 10, 50);
    return scene;
}

/**
 * Creates a perspective camera with sensible defaults
 */
export function createCamera(aspect: number): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    return camera;
}

/**
 * Creates a WebGL renderer with optimized settings
 */
export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true, // Required for screenshot export
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = false; // Disabled for performance
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.NoToneMapping;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    return renderer;
}

/**
 * Creates a grid helper for the scene
 */
export function createGridHelper(): THREE.GridHelper {
    return new THREE.GridHelper(20, 20, 0x888888, 0x444444);
}

/**
 * Creates basic lighting setup for the scene
 */
export function createLighting(): THREE.Light[] {
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = false; // Disabled for performance
    return [ambientLight, directionalLight];
}

/**
 * Creates a 3D object based on the specified type
 */
export function createObject(type: ObjectType): THREE.Object3D {
    let mesh: THREE.Mesh;

    switch (type) {
        case ObjectType.BOX:
            mesh = new THREE.Mesh(
                new THREE.BoxGeometry(2, 2, 2),
                new THREE.MeshStandardMaterial({ color: 0x00ff00 })
            );
            mesh.name = 'Box';
            break;

        case ObjectType.SPHERE:
            mesh = new THREE.Mesh(
                new THREE.SphereGeometry(1, 32, 32),
                new THREE.MeshStandardMaterial({ color: 0x0088ff })
            );
            mesh.name = 'Sphere';
            break;

        case ObjectType.CYLINDER:
            mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(1, 1, 2, 32),
                new THREE.MeshStandardMaterial({ color: 0xff8800 })
            );
            mesh.name = 'Cylinder';
            break;

        case ObjectType.PLANE:
            mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(5, 5),
                new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide })
            );
            mesh.name = 'Plane';
            mesh.rotation.x = -Math.PI / 2;
            break;

        case ObjectType.TORUS:
            mesh = new THREE.Mesh(
                new THREE.TorusGeometry(1, 0.4, 16, 100),
                new THREE.MeshStandardMaterial({ color: 0xff00ff })
            );
            mesh.name = 'Torus';
            break;

        case ObjectType.CONE:
            mesh = new THREE.Mesh(
                new THREE.ConeGeometry(1, 2, 32),
                new THREE.MeshStandardMaterial({ color: 0xffff00 })
            );
            mesh.name = 'Cone';
            break;

        case ObjectType.TORUS_KNOT:
            mesh = new THREE.Mesh(
                new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
                new THREE.MeshStandardMaterial({ color: 0xff0088 })
            );
            mesh.name = 'TorusKnot';
            break;

        case ObjectType.DODECAHEDRON:
            mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(1),
                new THREE.MeshStandardMaterial({ color: 0x00ffff })
            );
            mesh.name = 'Dodecahedron';
            break;

        case ObjectType.ICOSAHEDRON:
            mesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(1),
                new THREE.MeshStandardMaterial({ color: 0x8800ff })
            );
            mesh.name = 'Icosahedron';
            break;

        case ObjectType.OCTAHEDRON:
            mesh = new THREE.Mesh(
                new THREE.OctahedronGeometry(1),
                new THREE.MeshStandardMaterial({ color: 0xff8800 })
            );
            mesh.name = 'Octahedron';
            break;

        default:
            mesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 0xffffff })
            );
    }

    mesh.castShadow = false; // Disabled for performance
    mesh.receiveShadow = false; // Disabled for performance
    mesh.position.set(0, 1, 0);

    return mesh;
}

/**
 * Creates a light object based on the specified type
 */
export function createLight(type: ObjectType): THREE.Light {
    let light: THREE.Light;

    switch (type) {
        case ObjectType.LIGHT_POINT:
            light = new THREE.PointLight(0xffffff, 1, 100);
            light.name = 'PointLight';
            light.position.set(0, 5, 0);
            break;

        case ObjectType.LIGHT_DIRECTIONAL:
            light = new THREE.DirectionalLight(0xffffff, 1);
            light.name = 'DirectionalLight';
            light.position.set(5, 10, 5);
            break;

        case ObjectType.LIGHT_AMBIENT:
            light = new THREE.AmbientLight(0xffffff, 0.5);
            light.name = 'AmbientLight';
            break;

        default:
            light = new THREE.AmbientLight(0xffffff, 0.5);
    }

    return light;
}

/**
 * Disposes of a material and its textures
 */
function disposeMaterial(material: THREE.Material): void {
    Object.keys(material).forEach((key) => {
        const value = (material as unknown as Record<string, unknown>)[key];
        if (value && typeof value === 'object' && 'dispose' in value && typeof (value as any).dispose === 'function') {
            (value as any).dispose();
        }
    });
    material.dispose();
}

/**
 * Properly disposes of a Three.js object and its resources
 */
export function disposeObject(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh) {
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach((material) => disposeMaterial(material));
            } else {
                disposeMaterial(object.material);
            }
        }
    }
    object.children.forEach((child) => disposeObject(child));
}

/**
 * Disposes of a renderer and cleans up resources
 */
export function disposeRenderer(renderer: THREE.WebGLRenderer): void {
    renderer.dispose();
    renderer.forceContextLoss();
}

export function colorToHex(color: number): string {
    return `#${color.toString(16).padStart(6, '0')}`;
}

export function hexToColor(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
}

export function isMesh(object: THREE.Object3D): object is THREE.Mesh {
    return object instanceof THREE.Mesh;
}

export function isLight(object: THREE.Object3D): object is THREE.Light {
    return object instanceof THREE.Light;
}

export function handleResize(
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    width: number,
    height: number
): void {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
