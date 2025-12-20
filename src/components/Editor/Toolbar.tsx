/**
 * Toolbar Component
 * 
 * Provides quick access to transform modes and space toggle:
 * - Select, Translate, Rotate, Scale modes
 * - Local/World space toggle
 * 
 * Based on original editor's Toolbar with space toggle checkbox.
 * 
 * @reference editor/js/Toolbar.js
 */

'use client';

import { ToolbarProps, EditorMode } from '@/types/editor';

interface ExtendedToolbarProps extends ToolbarProps {
    transformSpace?: 'local' | 'world';
    onTransformSpaceChange?: (space: 'local' | 'world') => void;
}

export default function Toolbar({
    mode,
    onModeChange,
    transformSpace = 'world',
    onTransformSpaceChange,
    className = ''
}: ExtendedToolbarProps) {
    const modes = [
        { value: EditorMode.SELECT, label: 'Select', icon: '↖️' },
        { value: EditorMode.TRANSLATE, label: 'Move', icon: '✥' },
        { value: EditorMode.ROTATE, label: 'Rotate', icon: '↻' },
        { value: EditorMode.SCALE, label: 'Scale', icon: '⤢' },
    ];

    const handleSpaceToggle = () => {
        if (onTransformSpaceChange) {
            onTransformSpaceChange(transformSpace === 'world' ? 'local' : 'world');
        }
    };

    return (
        <div className={`flex items-center gap-2 bg-neutral-800 border-b border-neutral-700 px-4 py-2 ${className}`}>
            {/* Transform Mode Buttons */}
            <div className="flex gap-1">
                {modes.map((m) => (
                    <button
                        key={m.value}
                        onClick={() => onModeChange(m.value)}
                        className={`
              px-4 py-2 text-sm font-medium rounded transition-colors
              ${mode === m.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                            }
            `}
                        title={m.label}
                    >
                        <span className="mr-2">{m.icon}</span>
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-neutral-600" />

            {/* Local/World Space Toggle */}
            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer hover:text-white transition-colors">
                <input
                    type="checkbox"
                    checked={transformSpace === 'local'}
                    onChange={handleSpaceToggle}
                    className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 text-blue-600 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="select-none">
                    {transformSpace === 'local' ? 'Local Space' : 'World Space'}
                </span>
            </label>
        </div>
    );
}
