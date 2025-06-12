'use client';

import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import OtpForm from './OtpForm';
import ModalWrapper from './ModalWrapper';

const LoginModal: React.FC = () => {
  // State to control modal visibility and type
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'otp'>('login');
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // State for mobile number
  const [mobileNumber, setMobileNumber] = useState('');
  // State for OTP input
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  // State for resend timer
  const [timer, setTimer] = useState(49);

  // Hardcoded OTP for testing
  const HARDCODED_OTP = '123456';

  // Timer effect for OTP resend
  useEffect(() => {
    if (modalType === 'otp' && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [modalType, timer]);

  // Handle login submission
  const handleLoginSubmit = () => {
    if (mobileNumber.length === 10) {
      setModalType('otp');
      setTimer(49);
      console.log(`For testing, use OTP: ${HARDCODED_OTP}`);
    } else {
      alert('Please enter a valid 10-digit mobile number.');
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = () => {
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      if (otpValue === HARDCODED_OTP) {
        setIsLoggedIn(true);
        setIsOpen(false);
        setModalType('login');
        setMobileNumber('');
        setOtp(['', '', '', '', '', '']);
        alert('OK');
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } else {
      alert('Please enter a valid 6-digit OTP.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    setTimer(49);
    setOtp(['', '', '', '', '', '']);
    console.log(`For testing, use OTP: ${HARDCODED_OTP}`);
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p className="text-green-600 font-medium">Successfully logged in!</p>
          <button
            className="bg-red-500 text-white font-medium py-2 px-4 rounded-md hover:bg-red-600 transition-colors mt-2"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          className="bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          Login/Signup
        </button>
      )}

      {isOpen && (
        <ModalWrapper setIsOpen={setIsOpen} setModalType={setModalType} setMobileNumber={setMobileNumber} setOtp={setOtp}>
          {modalType === 'login' ? (
            <LoginForm
              mobileNumber={mobileNumber}
              setMobileNumber={setMobileNumber}
              handleLoginSubmit={handleLoginSubmit}
            />
          ) : (
            <OtpForm
              mobileNumber={mobileNumber}
              otp={otp}
              setOtp={setOtp}
              timer={timer}
              handleOtpSubmit={handleOtpSubmit}
              handleResendOtp={handleResendOtp}
              setModalType={setModalType}
            />
          )}
        </ModalWrapper>
      )}
    </div>
  );
};

export default LoginModal;