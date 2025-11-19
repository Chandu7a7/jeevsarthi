import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({ value, onValueChange, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  // Parse children to extract options
  const options = [];
  let triggerProps = {};
  let contentProps = {};
  
  React.Children.forEach(children, (child) => {
    if (!child) return;
    
    if (child.type === SelectTrigger) {
      triggerProps = {
        className: child.props.className || '',
        id: child.props.id,
      };
    } else if (child.type === SelectContent) {
      contentProps = {
        className: child.props.className || '',
      };
      
      // Extract SelectItem children
      React.Children.forEach(child.props.children, (item) => {
        if (item && item.type === SelectItem) {
          options.push({
            value: item.props.value,
            label: item.props.children,
            className: item.props.className || '',
          });
        }
      });
    }
  });
  
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : 'Select...';
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerProps.className || "flex h-10 w-full items-center justify-between rounded-[12px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:ring-offset-2 focus:border-[#2E7D32] cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"}
        id={triggerProps.id}
      >
        <span className="flex-1 text-left">{displayValue}</span>
        <ChevronDown className={`ml-2 h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1">
            <div className={contentProps.className || "z-50 w-full overflow-hidden rounded-[12px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"}>
              {options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`relative flex cursor-pointer select-none items-center px-3 py-2.5 text-sm outline-none transition-colors ${
                    value === option.value 
                      ? 'bg-[#2E7D32]/10 dark:bg-[#2E7D32]/20 text-[#2E7D32] dark:text-[#4CAF50] font-medium' 
                      : 'text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${option.className} ${index === 0 ? 'rounded-t-[12px]' : ''} ${index === options.length - 1 ? 'rounded-b-[12px]' : ''}`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Placeholder components for JSX structure
export const SelectTrigger = ({ children, ...props }) => {
  return null;
};

export const SelectContent = ({ children, ...props }) => {
  return null;
};

export const SelectValue = () => {
  return null;
};

export const SelectItem = ({ children, ...props }) => {
  return null;
};
