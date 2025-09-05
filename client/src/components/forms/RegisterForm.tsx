import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { RegisterFormData } from '../../types';
import { validateEmail, validatePassword, validateUsername } from '../../utils';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
    
    // Clear field error
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        newErrors.username = usernameValidation.errors[0];
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      // Redirect to chat page after successful registration
      navigate('/chat');
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            error={errors.first_name}
            placeholder="First name"
            autoComplete="given-name"
          />

          <Input
            label="Last Name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            error={errors.last_name}
            placeholder="Last name"
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          error={errors.username}
          placeholder="Choose a username"
          autoComplete="username"
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          autoComplete="new-password"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        disabled={loading}
      >
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;
