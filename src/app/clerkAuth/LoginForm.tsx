import React, { useState } from 'react';

interface LoginFormProps {
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  handleLoginSubmit: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  mobileNumber,
  setMobileNumber,
  handleLoginSubmit,
}) => {
  const [isChecked, setIsChecked] = useState(true);

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobileNumber(value);
    }
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Enter Mobile Number*
        </label>
        <div className="flex items-center border rounded-md">
          <span className="px-3 py-2 bg-gray-100 border-r text-gray-600">+91</span>
          <input
            type="tel"
            value={mobileNumber}
            onChange={handleMobileNumberChange}
            placeholder="Enter your mobile number"
            className="w-full px-3 py-2 border-none focus:outline-none"
            maxLength={10}
          />
        </div>
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-600">
          I Agree to{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms and Conditions
          </a>
          ,{' '}
          <a href="#" className="text-blue-600 hover:underline">
            T&C's Privacy Policy
          </a>.
        </label>
      </div>

      <button
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        onClick={() => {
          if (isChecked) {
            handleLoginSubmit();
          } else {
            alert('Please agree to the terms.');
          }
        }}
      >
        Login with OTP
      </button>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-sm text-gray-500">Or Login Using</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition-colors">
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="w-5 h-5 mr-2"
        />
        <span>Google</span>
      </button>
    </>
  );
};

export default LoginForm;