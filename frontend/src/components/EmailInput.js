'use client';

import React, { useState, useEffect } from 'react';

export default function EmailInput({ value, onChange, disabled, error, label = "Email" }) {
  const [inputError, setInputError] = useState(error || null);

  useEffect(() => {
    if (error !== inputError) {
      setInputError(error);
    }
  }, [error]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (!validateEmail(val)) {
      setInputError('Invalid email address');
    } else {
      setInputError(null);
    }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor="email" style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
        {label}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 4,
          borderColor: inputError ? "red" : "#ccc",
          borderStyle: "solid",
          borderWidth: 1,
          outline: 'none'
        }}
      />
      {inputError && <p style={{ color: "red", marginTop: 4 }}>{inputError}</p>}
    </div>
  );
}
