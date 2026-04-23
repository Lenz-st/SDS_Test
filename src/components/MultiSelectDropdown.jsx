import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option) => {
    if (option === 'ทั้งหมด') {
      onChange([]);
      return;
    }

    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    
    onChange(newValues);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return 'ทั้งหมด';
    if (selectedValues.length === 1) return selectedValues[0];
    return `เลือกแล้ว ${selectedValues.length} รายการ`;
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="flex items-center justify-between w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 bg-white/50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate flex-1 text-gray-700 select-none text-sm">{getDisplayText()}</span>
        <div className="flex items-center space-x-1">
          {selectedValues.length > 0 && (
            <div 
              className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </div>
          )}
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden">
          <div className="p-2 space-y-1">
            <div className="px-2 pb-2 pt-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {searchTerm === '' && (
              <div 
                className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedValues.length === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => handleToggleOption('ทั้งหมด')}
              >
                <div className={`flex flex-shrink-0 items-center justify-center w-5 h-5 border rounded mr-3 ${selectedValues.length === 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                  {selectedValues.length === 0 && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className={`text-sm ${selectedValues.length === 0 ? 'font-medium text-blue-700' : 'text-gray-700'}`}>ทั้งหมด (ไม่กรอง)</span>
              </div>
            )}
            
            {options
              .filter(opt => opt !== 'ทั้งหมด' && opt.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((option) => {
              const isSelected = selectedValues.includes(option);
              return (
                <div 
                  key={option}
                  className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  onClick={() => handleToggleOption(option)}
                >
                  <div className={`flex flex-shrink-0 items-center justify-center w-5 h-5 border rounded mr-3 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`text-sm truncate ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>{option}</span>
                </div>
              );
            })}
            
            {options.filter(opt => opt !== 'ทั้งหมด' && opt.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                ไม่พบผลลัพธ์
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
