import React, { useRef, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

export const EditableText = ({
  value = '',
  onSave,
  as: Component = 'span',
  className = '',
  style = {},
  placeholder = 'Click to edit...',
  singleLine = false,
  ...props
}) => {
  const { isEditMode } = usePortfolio();
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current && textRef.current.innerText !== value) {
      textRef.current.innerText = value || '';
    }
  }, [value]);

  if (!isEditMode) {
    return (
      <Component className={className} style={style} {...props}>
        {value || ''}
      </Component>
    );
  }

  const handleBlur = () => {
    if (!textRef.current) return;
    const currentText = textRef.current.innerText.trim();
    if (currentText !== value) {
      onSave?.(currentText);
    }
  };

  const handleKeyDown = (e) => {
    if (singleLine && e.key === 'Enter') {
      e.preventDefault();
      textRef.current?.blur();
    }
    if (e.key === 'Escape') {
      if (textRef.current) textRef.current.innerText = value || '';
      textRef.current?.blur();
    }
  };

  return (
    <Component
      ref={textRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      title="Click to edit with your keyboard"
      className={`outline-none hover:outline-dashed hover:outline-1 hover:outline-indigo-400/60 focus:outline-solid focus:outline-2 focus:outline-indigo-500 rounded px-1 -mx-1 transition-all cursor-text selection:bg-indigo-500 selection:text-white ${className}`}
      style={style}
      {...props}
    >
      {value || placeholder}
    </Component>
  );
};
