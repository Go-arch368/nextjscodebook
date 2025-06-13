'use client';

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';

interface LoginFormProps {
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  handleLoginSubmit: () => void;
  setIsOpen: (value: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  mobileNumber,
  setMobileNumber,
  handleLoginSubmit,
  setIsOpen,
}) => {
  const [isChecked, setIsChecked] = useState(true);
  const { signIn } = useSignIn();

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobileNumber(value);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('Initiating Google login');
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/category?pincode=573201',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Google login error:', error);
      alert('Failed to initiate Google login.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <span className="px-4 py-3 bg-gray-100 border-r text-gray-600 text-sm font-medium">+91</span>
          <input
            type="tel"
            value={mobileNumber}
            onChange={handleMobileNumberChange}
            placeholder="Enter your mobile number"
            className="w-full px-4 py-3 text-sm border-none focus:outline-none placeholder-gray-400"
            maxLength={10}
            aria-label="Mobile number"
          />
        </div>
      </div>

      <div className="flex items-start">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          id="terms"
        />
        <label htmlFor="terms" className="ml-3 text-sm text-gray-600 leading-tight">
          I agree to{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>.
        </label>
      </div>

      <button
        className="w-full bg-blue-600 text-white py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={() => {
          if (isChecked) {
            handleLoginSubmit();
          } else {
            alert('Please agree to the terms.');
          }
        }}
        disabled={!isChecked || mobileNumber.length !== 10}
      >
        Login with OTP
      </button>

      <div className="flex items-center">
        <hr className="flex-grow border-gray-200" />
        <span className="mx-4 text-sm text-gray-500">Or Login Using</span>
        <hr className="flex-grow border-gray-200" />
      </div>

      <button
        className="w-full flex items-center justify-center border border-gray-300 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={handleGoogleLogin}
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
        Continue with Google
      </button>
    </div>
  );
};

export default LoginForm;