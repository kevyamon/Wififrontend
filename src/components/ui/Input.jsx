import React from 'react';

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`input-field ${className}`}
      {...props}
    />
  );
};

export default Input;
