import React from 'react';

interface ModalWrapperProps {
  children: React.ReactNode;
  setIsOpen: (value: boolean) => void;
  setModalType: (value: 'login' | 'otp') => void;
  setMobileNumber: (value: string) => void;
  setOtp: (value: string[]) => void;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  setIsOpen,
  setModalType,
  setMobileNumber,
  setOtp,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50">
      {/* Modal container */}
      <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-3xl font-bold text-blue-600">District</span>
            <span className="text-3xl font-bold text-orange-500">Business</span>
          </div>
          {/* Title and subtitle */}
          <div className="flex flex-col space-y-0.5">
            <h2 className="text-xl font-semibold text-gray-800 text-right">Welcome</h2>
            <p className="text-sm text-gray-500 text-right">Login for a seamless experience</p>
          </div>
        </div>
        {/* Content */}
        <div className="mt-4">{children}</div>
        {/* Skip button */}
        <div className="mt-8 text-center flex justify-end">
          <button
            className="border border-blue-600 text-blue-600 py-2 px-6 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
            onClick={() => {
              setIsOpen(false);
              setModalType('login');
              setMobileNumber('');
              setOtp(['', '', '', '', '', '']);
              console.log('Skip clicked');
            }}
            aria-label="Skip login"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;