// Custom Select Component
import React, {useEffect, useRef, useState} from "react";
import {ChevronDown} from "lucide-react";

export const MaterialSelect: React.FC<{
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}> = ({options, value, onChange, placeholder = "Выберите...", className = "", disabled = false}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value) || null;

    const handleOptionClick = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={selectRef} data-testid="material-select">
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-disabled={disabled}
                className={`flex items-center justify-between px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                    disabled
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                        : 'bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500'
                }`}
                onClick={toggleDropdown}
                data-testid="material-select-trigger"
                data-value={value}
            >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"} data-testid="material-select-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
                        disabled ? 'text-gray-400' : 'text-gray-500'
                    }`}
                    data-testid="material-select-chevron"
                />
            </div>

            {isOpen && !disabled && (
                <div
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                    data-testid="material-select-dropdown"
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                                option.value === value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                            }`}
                            onClick={() => handleOptionClick(option.value)}
                            data-testid={`material-select-option-${option.value}`}
                            data-option-value={option.value}
                            data-option-label={option.label}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};