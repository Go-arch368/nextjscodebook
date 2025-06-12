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
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">District</span>
            <span className="text-2xl font-bold text-orange-500">Business</span>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="text-right">
              <h2 className="text-lg font-semibold">Welcome</h2>
              <p className="text-sm text-gray-600">Login for a seamless experience</p>
            </div>
            <button
              className="text-gray-600 hover:text-gray-800"
              onClick={() => {
                setIsOpen(false);
                setModalType('login');
                setMobileNumber('');
                setOtp(['', '', '', '', '', '']);
              }}
            >
              ✕
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;