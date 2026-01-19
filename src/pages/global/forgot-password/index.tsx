import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Button from '../../../components/atoms/button/Button';
import { TextInput } from '../../../components/atoms/input/TextInput';
import authService from '../../../services/auth';

const ForgotPasswordPage: React.FC = () => {
  const [checkEmailMessage, setCheckEmailMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const COOLDOWN_TIME = 60; // 60 seconds cooldown

  // Effect to handle cooldown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Validation schema cho trang quên mật khẩu
  const fieldValidationSchema = yup.object({
    email: yup.string().required('Email hoặc số điện thoại là bắt buộc'),
  });

  const { forgotPassword } = authService;
  const forgotPasswordHandler = async (email: string) => {
    console.log(cooldown);
    
    if (cooldown > 0) {
      return;
    }
    
    try {
      await forgotPassword(email);
      setCheckEmailMessage('Email đã được gửi đến bạn');
      setCooldown(COOLDOWN_TIME);
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      setCheckEmailMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50">
      <div className="h-auto w-96 bg-white p-8 rounded-2xl shadow-2xl border border-pink-300">
        <h1 className="text-5xl font-extrabold text-pink-600 mb-8 text-center">PinkPonk</h1>

        <Formik
          initialValues={{
            email: '',
          }}
          onSubmit={(values) => {
            console.log(values);
            forgotPasswordHandler(values.email);
          }}
          validationSchema={fieldValidationSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              {/* Email hoặc số điện thoại */}
              <TextInput
                inputsize="large"
                type="text"
                placeholder="Email"
                name="email"
                className="w-full p-4 mb-5 border border-pink-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-300"
              />

              {/* Nút gửi yêu cầu */}
              <Button
                type="submit"
                size="large"
                block
                fontSize="text-xl"
                fontWeight="font-bold"
                disabled={cooldown > 0}
                className={`w-full py-3 rounded-lg transition duration-300 ease-in-out ${
                  cooldown > 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700 text-white'
                }`}
              >
                {cooldown > 0 ? `Vui lòng đợi ${cooldown}s` : 'Gửi yêu cầu'}
              </Button>
            </form>
          )}
        </Formik>

        {checkEmailMessage && (
          <div className="text-center mt-6">
            <p className={`${cooldown > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {checkEmailMessage}
            </p>
          </div>
        )}

        {/* Liên kết */}
        <div className="text-center mt-6">
          <a href="login" className="text-pink-500 hover:underline font-medium">
            Đã nhớ mật khẩu? Đăng nhập
          </a>
          <span className="text-gray-500 mx-2">•</span>
          <a href="register" className="text-pink-500 hover:underline font-medium">
            Chưa có tài khoản? Đăng ký
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
