import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface OffsleekSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  name?: string;
  align?: 'left' | 'right';
  variant?: 'default' | 'subtle' | 'cardHeader';
  'aria-label'?: string;
}

/**
 * OFFSLEEK Design System Custom Dropdown / Select Component
 *
 * Implements:
 * - Pure white background, subtle light-grey borders (border-neutral-200/90)
 * - Near-black text (text-neutral-900 / neutral-800)
 * - Restrained rounded corners (rounded-lg or rounded-xl)
 * - Exact left-alignment and 100% width match with trigger
 * - Understated shadow and smooth animations
 * - High-contrast black and white hover, focus, and selected states
 * - Robust click-outside, Esc key, and arrow key accessibility
 */
export const OffsleekSelect: React.FC<OffsleekSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  disabled = false,
  size = 'md',
  id,
  name,
  align = 'left',
  variant = 'default',
  'aria-label': ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<'bottom' | 'top'>('bottom');
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return { ...opt, value: String(opt.value) };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Measure trigger width & viewport boundaries on open
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerWidth(rect.width);

      // Check vertical space in viewport
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimatedMenuHeight = Math.min(normalizedOptions.length * 36 + 12, 240);

      if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
        setMenuPlacement('top');
      } else {
        setMenuPlacement('bottom');
      }

      // Set initial focused index to selected item
      const idx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, normalizedOptions.length]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          let next = prev + 1;
          while (next < normalizedOptions.length && normalizedOptions[next].disabled) {
            next++;
          }
          return next < normalizedOptions.length ? next : prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && normalizedOptions[next].disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
          const opt = normalizedOptions[focusedIndex];
          if (!opt.disabled) {
            onChange(opt.value);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (val: string, isDisabled?: boolean) => {
    if (isDisabled) return;
    onChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Sizing definitions matching OFFSLEEK design system
  const sizeStyles = {
    sm: {
      trigger: 'text-xs py-1.5 px-2.5 rounded-lg gap-2 font-medium',
      item: 'text-xs py-1.5 px-2.5',
      icon: 'w-3 h-3',
      menu: 'text-xs rounded-lg py-1',
    },
    md: {
      trigger: 'text-xs sm:text-[13px] py-2 px-3 rounded-lg gap-2 font-medium',
      item: 'text-xs sm:text-[13px] py-2 px-3',
      icon: 'w-3.5 h-3.5',
      menu: 'text-xs sm:text-[13px] rounded-lg py-1',
    },
    lg: {
      trigger: 'text-sm py-2.5 px-3.5 rounded-xl gap-2.5 font-medium',
      item: 'text-sm py-2 px-3.5',
      icon: 'w-4 h-4',
      menu: 'text-sm rounded-xl py-1.5',
    },
  }[size];

  // Variant styling
  const variantStyles = {
    default: 'bg-white border-neutral-200/90 text-neutral-900 hover:border-neutral-300 focus:border-neutral-900',
    subtle: 'bg-white border-neutral-200/90 text-neutral-900 hover:border-neutral-300 focus:border-neutral-900',
    cardHeader: 'bg-white border-neutral-200/90 text-neutral-900 hover:border-neutral-300 focus:border-neutral-900 font-semibold',
  }[variant];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for HTML form compatibility */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          disabled={disabled}
        />
      )}

      {/* Dropdown Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={selectId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between border transition-all duration-150 cursor-pointer select-none text-left focus:outline-none focus:ring-2 focus:ring-neutral-900/10 ${sizeStyles.trigger} ${variantStyles} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100' : ''
        } ${isOpen ? 'border-neutral-900 ring-2 ring-neutral-900/10' : ''} ${triggerClassName}`}
      >
        <span className="truncate block font-sans">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${sizeStyles.icon} ${
            isOpen ? 'rotate-180 text-neutral-900' : ''
          }`}
        />
      </button>

      {/* OFFSLEEK Dropdown Menu Popover */}
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          style={
            triggerWidth
              ? {
                  width: `${triggerWidth}px`,
                  minWidth: `${triggerWidth}px`,
                  maxWidth: `${triggerWidth}px`,
                }
              : undefined
          }
          className={`absolute z-50 w-full bg-white border border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-y-auto max-h-60 animate-in fade-in-50 zoom-in-95 duration-150 box-border ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            menuPlacement === 'top'
              ? 'bottom-full mb-1'
              : 'top-full mt-1'
          } ${sizeStyles.menu} ${menuClassName}`}
        >
          {normalizedOptions.map((option, index) => {
            const isSelected = String(option.value) === String(value);
            const isFocused = index === focusedIndex;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => handleSelect(option.value, option.disabled)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`w-full text-left flex items-center justify-between transition-colors select-none cursor-pointer ${
                  sizeStyles.item
                } ${
                  isSelected || isFocused
                    ? 'bg-neutral-900 font-semibold text-white'
                    : 'text-neutral-900 hover:bg-neutral-900 hover:text-white'
                } ${option.disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-neutral-900' : ''}`}
              >
                <span className="truncate pr-2 font-sans">{option.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
