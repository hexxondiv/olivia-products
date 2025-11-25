import React, { useState, useRef, useEffect } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { FaChevronDown, FaSearch } from 'react-icons/fa';

interface SearchableSelectOption {
  value: string;
  label: string;
  image?: string;
  metadata?: string;
}

interface SearchableSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  label?: string;
  isInvalid?: boolean;
  required?: boolean;
  errorMessage?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  label,
  isInvalid = false,
  required = false,
  errorMessage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.metadata && option.metadata.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = (nextShow: boolean) => {
    setIsOpen(nextShow);
    if (!nextShow) {
      setSearchTerm('');
    }
  };

  return (
    <div ref={dropdownRef}>
      {label && (
        <Form.Label>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}
      <Dropdown show={isOpen} onToggle={handleToggle} className="w-100">
        <Dropdown.Toggle
          variant="outline-secondary"
          className="w-100 d-flex justify-content-between align-items-center"
          style={{
            textAlign: 'left',
            backgroundColor: '#fff',
            borderColor: isInvalid ? '#dc3545' : '#ced4da'
          }}
        >
          <span className="text-truncate" style={{ flex: 1 }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <FaChevronDown className="ms-2" style={{ fontSize: '0.75rem' }} />
        </Dropdown.Toggle>

        <Dropdown.Menu className="w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <div className="p-2 border-bottom">
            <div className="position-relative">
              <FaSearch
                className="position-absolute"
                style={{
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6c757d',
                  fontSize: '0.875rem'
                }}
              />
              <Form.Control
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ paddingLeft: '35px' }}
              />
            </div>
          </div>
          {filteredOptions.length === 0 ? (
            <Dropdown.Item disabled>
              <div className="text-muted text-center py-2">No options found</div>
            </Dropdown.Item>
          ) : (
            filteredOptions.map((option) => (
              <Dropdown.Item
                key={option.value}
                onClick={() => handleSelect(option.value)}
                active={value === option.value}
                className="d-flex align-items-center gap-2"
              >
                {option.image && (
                  <img
                    src={option.image}
                    alt={option.label}
                    style={{
                      width: '30px',
                      height: '30px',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-grow-1">
                  <div>{option.label}</div>
                  {option.metadata && (
                    <div className="small text-muted">{option.metadata}</div>
                  )}
                </div>
              </Dropdown.Item>
            ))
          )}
        </Dropdown.Menu>
      </Dropdown>
      {isInvalid && errorMessage && (
        <div className="text-danger small mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

