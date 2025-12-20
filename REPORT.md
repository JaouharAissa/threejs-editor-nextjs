# Migration Report: Three.js Editor to Next.js + TypeScript

**Author**: Jaouhar Aissa  
**Date**: December 20, 2025  
**Subject**: Technical Assessment - Three.js Editor Migration

---

## 1. Issues in the Original Example (`editor/js/*.js`)

An analysis of the original codebase revealed several patterns that limit scalability, type safety, and maintainability.

### A. Global Event Bus & Tight Coupling
*   **File**: `editor/js/Editor.js` (Lines 19-97)
*   **Issue**: The editor relies on a massive `signals` object attached to the global `Editor` instance. Every component (Viewport, Sidebar, Toolbar) must have a reference to the entire `editor` object to communicate.
*   **Impact**: This makes components impossible to test in isolation and creates "spaghetti code" where any component can trigger any side effect in any other component.
*   **Migration Fix**: Replaced with React Context (`useEditorState`) and prop drilling where appropriate. Components define clear interfaces for what they need (e.g., `onObjectSelect`, `transformSpace`).

### B. Mixed View and Business Logic
*   **File**: `editor/js/Viewport.js` (Lines 27-32, 270-272)
*   **Issue**: The `Viewport` class manually creates DOM elements (`container.dom.appendChild`) and explicitly manages event listeners alongside complex 3D logic.
*   **Impact**: Violates Separation of Concerns. Changing the UI requires modifying 3D logic files.
*   **Migration Fix**: Separated UI (React/JSX) from 3D logic (Three.js). `Viewport.tsx` handles the canvas and UI props, while `useThreeScene` hook manages the Three.js scene graph.

### C. Mutable Global State
*   **File**: `editor/js/Editor.js` (Lines 115-119)
*   **Issue**: State containers like `this.object`, `this.geometries`, and `this.materials` are exposed as mutable public properties.
*   **Impact**: Changes to state are hard to track. There is no "source of truth" that guarantees the UI is in sync with the data.
*   **Migration Fix**: Used React's `useState` and `useReducer` to create a unidirectional data flow. Visual updates are side effects of state changes, not direct mutations.

### D. Manual Resource Management
*   **File**: `editor/js/Viewport.js` (Lines 340-345)
*   **Issue**: Disposal of resources (renderers, materials) is handled via manual calls inside signal listeners.
*   **Impact**: High risk of memory leaks if a developer forgets a disposal call or if an error interrupts the teardown sequence.
*   **Migration Fix**: Levied React's `useEffect` cleanup function. When a component unmounts, the disposal logic runs automatically and reliably.

---

## 2. Migration Approach: Vanilla JS → React + TypeScript

The migration strategy focused on moving from an **Imperative** (Manual DOM/State manipulation) to a **Declarative** (React/State-driven) architecture.

### Key Transformation Steps:
1.  **Strict TypeScript Interfaces**: Defined core types (`EditorState`, `ObjectType`, `ViewportConfig`) first. This replaced the "implicit knowledge" of the original JS files with explicit contracts.
2.  **Component Atomicity**: Broken down monolithic classes like `Sidebar.js` into focused React components:
    *   `Sidebar.tsx` (Container)
    *   `SceneHierarchy.tsx` (Logic-heavy tree view)
    *   `SceneTreeNode.tsx` (Recursive UI item)
3.  **Hook-Based Logic**: Extracted Three.js boilerplate into reusable hooks:
    *   `useThreeScene`: Manages scene/camera/renderer lifecycle.
    *   `useEditorState`: Manages selection, transform modes, and active tools.
4.  **Styling**: Replaced inline JS styles and CSS files with **Tailwind CSS** for maintainable, utility-first styling that matches the modern design requirements.

---

## 3. Architectural Decisions

### A. Recursive Scene Hierarchy
Instead of the original's imperative DOM construction (looping through arrays and appending `div`s), I implemented a **Recursive React Component** (`SceneTreeNode`).
*   **Why?**: It naturally handles the nested tree structure of a 3D scene (Group -> Mesh -> Child).
*   **Benefit**: "Expand/Collapse" state is managed cleanly by each node or a parent Context, and the DOM updates automatically when the scene graph changes.

### B. Controlled Inputs for Properties
The properties panel uses **Controlled Components**. The input values are tied to React state, which updates the Three.js object `onBlur` or `onChange`.
*   **Why?**: Prevents the "fighting" between Three.js internal state and DOM input state.
*   **Benefit**: Allows for validation, formatting, and immediate visual feedback (e.g., changing color).

### C. Separation of "App State" and "Scene State"
I chose *not* to store the entire Three.js Scene in React state (which would cause massive render loops).
*   **Decision**: React holds *references* and *metadata* (IDs, selection status, active tool), while Three.js retains the heavy object graph.
*   **Bridge**: Custom hooks sync the two. When an object is added in Three.js, we trigger a lightweight state update to refresh the React UI tree.

---

## 4. Scope & Trade-offs

Given the tight deadline, I prioritized **Core UX and Architecture** over feature parity.

### ✅ Successfully Implemented (Priority 1, 5, 9)
*   **Scene Hierarchy Tree**: Full outliner with expansion, selection sync, and visibility toggles.
*   **Geometry Creation**: 10 supported types (Box, Sphere, Torus, Dodecahedron, etc.) via menu.
*   **Transform Tools**: Complete Select/Move/Rotate/Scale with Local/World space toggle.
*   **Basic Properties**: Name, Position, Rotation, Scale, Visibility, and Color editing.

### ⚠️ Deferred Features (Phase 2 Roadmap)
1.  **Complex Geometry Editors**:
    *   *Original*: `Sidebar.Geometry.js` allows editing segment counts/radius *after* creation.
    *   *Current*: Objects are static meshes after creation.
    *   *Reason*: Requires regenerating geometry on the fly. Architectural patterns are ready, but implementation takes time.
2.  **Material System**:
    *   *Original*: Full support for Standard, Phong, Physical materials, maps, and textures.
    *   *Current*: Color picking only.
    *   *Reason*: The UI complexity for material slots and texture inputs is high.
3.  **File Import/Export**:
    *   *Original*: Supports GLB, OBJ, STL, etc.
    *   *Current*: Basic architecture ready, but specific loaders not hooked up.
4.  **Undo/Redo History**:
    *   *Original*: Specific Command pattern for every action.
    *   *Current*: State management is ready for it, but the Command stack is not fully populated.

---

## 5. If This Were Production (Next Steps)

If this project were continuing to production, the following steps would be immediate priorities:

1.  **Testing Strategy**:
    *   **Unit Tests**: Jest/Vitest for the helper functions (`createObject`, `transformers`).
    *   **E2E Tests**: Cypress/Playwright to verify the "Add Box -> Select -> Move" workflow (similar to the browser agent tests run during development).
    *   **Visual Regression**: Storybook to document and test the UI components (`Toolbar`, `Sidebar`) in isolation.

2.  **Performance Optimization**:
    *   **React.memo**: Memoize the `SceneTreeNode` to prevent re-rendering the entire tree when one leaf node changes.
    *   **Virtualization**: Use `react-window` for the Scene Hierarchy if the scene grows to thousands of objects.

3.  **Robustness**:
    *   **Error Boundaries**: Wrap the `Viewport` in an Error Boundary to prevent a WebGL crash from taking down the whole UI.
    *   **Context Loss Handling**: Listen for `webglcontextlost` and restore the scene automatically.

4.  **Feature Completion**:
    *   Implement the `Command` pattern fully for Undo/Redo.
    *   Add the Property Editors for specific geometry parameters (Radius, Segments).

---

**Conclusion**: This migration demonstrates that moving from a legacy imperative codebase to a modern declarative stack improves code quality, readability, and long-term maintainability without sacrificing performance, provided the boundary between React and WebGL is managed correctly.
