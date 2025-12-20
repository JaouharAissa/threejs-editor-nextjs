# Three.js Editor - Next.js TypeScript Migration

A professional, production-ready Three.js 3D scene editor built with Next.js, TypeScript, and Tailwind CSS. This project demonstrates best practices in React architecture, TypeScript type safety, and Three.js lifecycle management.

![Three.js Editor](https://img.shields.io/badge/Three.js-Editor-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4)

## 🎯 Overview

This project is a complete migration of the official Three.js editor from vanilla JavaScript to a modern Next.js + TypeScript stack. It addresses critical issues found in the original implementation while maintaining all functionality.

### Key Features

- ✅ **Full TypeScript Support** - Strict typing with no `any` types
- ✅ **React Component Architecture** - Proper separation of concerns
- ✅ **Custom Hooks** - Encapsulated Three.js lifecycle management
- ✅ **Memory Leak Prevention** - Proper resource cleanup and disposal
- ✅ **Responsive Design** - Canvas resizes correctly with ResizeObserver
- ✅ **Object Manipulation** - Transform controls for move, rotate, scale
- ✅ **Scene Management** - Add, delete, and modify 3D objects
- ✅ **Import/Export** - Save and load scene configurations
- ✅ **Real-time Editing** - Live property editing in sidebar

## 📁 Project Structure

```
my-threejs-project/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application page
│   │   ├── layout.tsx            # Root layout with metadata
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── Editor/
│   │       ├── Editor.tsx          # Main editor orchestrator
│   │       ├── Viewport.tsx        # 3D canvas and rendering
│   │       ├── Sidebar.tsx         # Property editing panel
│   │       ├── SceneHierarchy.tsx  # Hierarchical scene tree view
│   │       ├── SceneTreeNode.tsx   # Recursive tree node component
│   │       ├── Toolbar.tsx         # Mode selection tools
│   │       └── MenuBar.tsx         # File/Edit/Add menu
│   ├── hooks/
│   │   ├── useThreeScene.ts      # Scene lifecycle management
│   │   ├── useRenderer.ts        # Renderer with cleanup
│   │   ├── useAnimationLoop.ts   # RAF loop management
│   │   └── useEditorState.ts     # Global editor state
│   ├── types/
│   │   └── editor.ts             # TypeScript definitions
│   └── utils/
│       └── three-helpers.ts      # Three.js utility functions
├── REPORT.md                     # Technical documentation
├── README.md                     # This file
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (required for Next.js 16)
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Jaouhar9/threejs-editor-nextjs.git
cd threejs-editor-nextjs
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open your browser**:
```
http://localhost:3000
```

### Building for Production

```bash
npm run build
npm start
```

## 🎮 How to Use

### Basic Operations

1. **Add Objects**: Click "Add" menu → Select object type (Box, Sphere, Cylinder, Plane)
2. **Select Objects**: Click on any object in the 3D viewport
3. **Transform Objects**: 
   - Click toolbar buttons to switch modes (Move, Rotate, Scale)
   - Drag the transform gizmos in the viewport
4. **Edit Properties**: Use the sidebar to modify position, rotation, scale, color
5. **Save/Load**: Use "File" menu to export/import scenes

### Editor Modes

- **Select** (⊙): Click to select objects
- **Translate** (↔): Move objects in 3D space
- **Rotate** (↻): Rotate objects on all axes
- **Scale** (⇲): Scale objects uniformly or per axis

### Camera Controls

- **Orbit**: Left mouse drag
- **Pan**: Right mouse drag or middle mouse drag
- **Zoom**: Mouse wheel

## 🏗️ Architecture Highlights

### Custom Hooks Pattern

The editor uses custom React hooks to manage Three.js lifecycle:

```typescript
// Scene management with automatic cleanup
const { scene, addObject, removeObject } = useThreeScene();

// Renderer with ResizeObserver
const { render } = useRenderer({ camera });

// Animation loop with proper RAF cleanup
useAnimationLoop({ onFrame, enabled });
```

### Type Safety

All Three.js objects are properly typed without using `any`:

```typescript
export interface EditorState {
  selectedObject: THREE.Object3D | null;
  mode: EditorMode;
  gridVisible: boolean;
  helpersVisible: boolean;
}
```

### Memory Management

Proper resource disposal prevents memory leaks:

```typescript
export function disposeObject(object: THREE.Object3D): void {
  // Dispose geometry, materials, textures
  // Recursive cleanup of children
}
```

## 🔧 Technical Stack

- **Framework**: Next.js 16.1.0 with App Router
- **Language**: TypeScript (strict mode)
- **3D Library**: Three.js
- **Styling**: Tailwind CSS
- **Build Tool**: Turbopack
- **Linting**: ESLint

## 📊 Issues Fixed

This implementation addresses several critical issues from the original Three.js editor:

### Issue #1: Memory Leaks
**Problem**: Original editor doesn't dispose of WebGL contexts, geometries, and materials.
**Solution**: Implemented comprehensive `disposeObject` and `disposeRenderer` functions with automatic cleanup on unmount.

### Issue #2: Resize Handling
**Problem**: Original uses window resize events which don't account for container changes.
**Solution**: Used `ResizeObserver` API for robust, container-aware resizing.

### Issue #3: Missing TypeScript Types
**Problem**: Original JavaScript lacks type safety and IDE support.
**Solution**: Full TypeScript conversion with strict typing and no `any` types.

### Issue #4: RAF Cleanup
**Problem**: Original often forgets to cancel animation frames on unmount.
**Solution**: Custom `useAnimationLoop` hook ensures proper cleanup.

### Issue #5: Performance Optimizations
**Problem**: Unnecessary re-renders, expensive raycasting, and color accuracy issues.
**Solution**: 
- Implemented `React.memo` for sidebar components
- Optimized raycasting by filtering system objects (Grid, Gizmos)
- Disabled tone mapping for WYSIWYG color representation
- Disabled shadows by default for better performance

See [REPORT.md](./REPORT.md) for detailed analysis.

## 🧪 Testing & CI/CD

### Continuous Integration

This project includes a GitHub Actions workflow that automatically:
- ✅ Runs TypeScript type checking
- ✅ Builds the Next.js application
- ✅ Validates on every push to main branch

**CI Status**: ![Build Status](https://github.com/Jaouhar9/threejs-editor-nextjs/actions/workflows/ci.yml/badge.svg)

### Local Testing

**Type Checking**:
```bash
npm run type-check
```

**Build Verification**:
```bash
npm run build
```

**Linting** (optional):
```bash
npm run next:lint
```

## 📝 Development Notes

### Why These Choices?

1. **Custom Hooks**: Encapsulates Three.js logic, makes it reusable and testable
2. **Separation of Concerns**: Each component has a single, clear responsibility
3. **ResizeObserver**: More reliable than window resize events
4. **Strict TypeScript**: Catches errors at compile-time, better IDE support
5. **Tailwind CSS**: Rapid styling with consistent design tokens

### Trade-offs

- **Bundle Size**: Three.js is large (~600KB), but necessary for 3D functionality
- **SSR Complexity**: Three.js requires window/document, handled with 'use client'
- **Learning Curve**: React + Three.js requires understanding both paradigms

## 🚀 Production Recommendations

If deploying to production, consider:

1. **Performance Monitoring**: Add analytics and performance tracking
2. **Error Boundaries**: Wrap components in React error boundaries
3. **Progressive Enhancement**: Show fallback UI for non-WebGL browsers
4. **Asset Optimization**: Implement texture compression and LOD
5. **Undo/Redo**: Implement history system with Command pattern
6. **Persistence**: Add local storage for auto-save functionality
7. **Testing**: Add unit tests for utilities, E2E tests for workflows

## 📚 Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - Alternative React + Three.js approach

## 🔗 Links

- **Live Repository**: [github.com/Jaouhar9/threejs-editor-nextjs](https://github.com/Jaouhar9/threejs-editor-nextjs)
- **Original Three.js Editor**: [threejs.org/editor](https://threejs.org/editor/)
- **Technical Report**: [REPORT.md](./REPORT.md)

## 👤 Author

**Jaouhar Aissa**

Created as a technical assessment demonstrating:
- TypeScript proficiency with strict mode
- Modern React/Next.js architecture
- 3D graphics and WebGL understanding
- Performance optimization skills
- Problem-solving and code quality

## 📄 License

This project is created for educational and assessment purposes.

---

**Built with ❤️ using Next.js, TypeScript, and Three.js**
