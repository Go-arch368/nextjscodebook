import React from 'react';

interface OtpFormProps {
  mobileNumber: string;
  otp: string[];
  setOtp: (value: string[]) => void;
  timer: number;
  handleOtpSubmit: () => void;
  handleResendOtp: () => void;
  setModalType: (value: 'login' | 'otp') => void;
}

const OtpForm: React.FC<OtpFormProps> = ({
  mobileNumber,
  otp,
  setOtp,
  timer,
  handleOtpSubmit,
  handleResendOtp,
  setModalType,
}) => {
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || /\D/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Enter the code sent to +91 - {mobileNumber}{' '}
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setModalType('login')}
          >
            ✎
          </button>
        </label>
        <div className="flex justify-between mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              maxLength={1}
              className="w-12 h-12 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <span className="text-sm text-gray-600">
          Didn’t receive the OTP? Retry in 00:{timer < 10 ? `0${timer}` : timer}
        </span>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={handleResendOtp}
          disabled={timer > 0}
        >
          Resend OTP
        </button>
      </div>

      <button
        className={`w-full py-2 rounded-md text-white ${
          otp.join('').length === 6
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        } transition-colors`}
        onClick={handleOtpSubmit}
        disabled={otp.join('').length !== 6}
      >
        Continue
      </button>
    </>
  );
};

export default OtpForm;