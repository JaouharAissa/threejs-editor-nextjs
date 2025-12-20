/**
 * MenuBar Component
 * 
 * Provides file and edit operations:
 * - File: New, Export, Import
 * - Edit: Add objects, Clear scene
 * - View: Toggle grid, Toggle helpers
 * 
 * This component demonstrates dropdown menus and action handling.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MenuBarProps } from '@/types/editor';

export default function MenuBar({ onAction, className = '' }: MenuBarProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (menu: string) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const handleAction = (action: string) => {
        onAction(action);
        setActiveMenu(null);
    };

    const menus = {
        File: [
            { label: 'New Scene', action: 'file:new' },
            { label: 'Export Scene (JSON)', action: 'file:export' },
            { label: 'Export Screenshot (PNG)', action: 'file:screenshot' },
            { label: 'Import Scene', action: 'file:import' },
        ],
        Add: [
            { label: 'Box', action: 'add:box' },
            { label: 'Sphere', action: 'add:sphere' },
            { label: 'Cylinder', action: 'add:cylinder' },
            { label: 'Plane', action: 'add:plane' },
            { label: 'Torus', action: 'add:torus' },
            { label: 'Cone', action: 'add:cone' },
            { label: 'Torus Knot', action: 'add:torusKnot' },
            { label: 'Dodecahedron', action: 'add:dodecahedron' },
            { label: 'Icosahedron', action: 'add:icosahedron' },
            { label: 'Octahedron', action: 'add:octahedron' },
            { label: '---', action: '' },
            { label: 'Point Light', action: 'add:pointLight' },
            { label: 'Directional Light', action: 'add:directionalLight' },
            { label: 'Ambient Light', action: 'add:ambientLight' },
        ],
        View: [
            { label: 'Toggle Grid', action: 'view:toggleGrid' },
            { label: 'Toggle Helpers', action: 'view:toggleHelpers' },
        ],
        Edit: [
            { label: 'Delete Object', action: 'edit:delete' },
            { label: 'Clear Scene', action: 'edit:clear' },
        ],
    };

    return (
        <div
            ref={menuRef}
            className={`flex items-center gap-4 bg-neutral-900 border-b border-neutral-700 px-4 py-1 ${className}`}
        >
            {Object.entries(menus).map(([menuName, items]) => (
                <div key={menuName} className="relative">
                    <button
                        onClick={() => handleMenuClick(menuName)}
                        className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${activeMenu === menuName
                                ? 'bg-neutral-700 text-white'
                                : 'text-neutral-300 hover:bg-neutral-800'
                            }
            `}
                    >
                        {menuName}
                    </button>

                    {activeMenu === menuName && (
                        <div className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-700 rounded shadow-lg z-50 min-w-[180px]">
                            {items.map((item, index) => (
                                item.label === '---' ? (
                                    <div key={index} className="border-t border-neutral-700 my-1" />
                                ) : (
                                    <button
                                        key={item.action}
                                        onClick={() => handleAction(item.action)}
                                        className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </button>
                                )
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
