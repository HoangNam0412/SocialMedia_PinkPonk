import { Formik } from 'formik';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import Button from '../../../components/atoms/button/Button';
import { TextInput } from '../../../components/atoms/input/TextInput';
import authService, { IResetPasswordData } from '../../../services/auth';

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  // Validation schema cho trang quên mật khẩu
  const fieldValidationSchema = yup.object({
    password: yup
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .required('Mật khẩu là bắt buộc'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Mật khẩu không khớp')
      .required('Xác nhận mật khẩu là bắt buộc'),
  });

  const { resetPassword } = authService;
  const resetPasswordHandler = async (values: IResetPasswordData) => {
    const queryParrams = new URLSearchParams(location.search);
    const resetToken = queryParrams.get('token');
    if (resetToken) {
      try {
        await resetPassword({ ...values, resetToken });
        setSuccessMessage('Đổi mật khẩu thành công!');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        setSuccessMessage('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-50">
      <div className="h-auto w-96 rounded-2xl border border-pink-300 bg-white p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-5xl font-extrabold text-pink-600">
          PinkPonk
        </h1>

        <Formik
          initialValues={{
            password: '',
            confirmPassword: '',
          }}
          onSubmit={(values) => {
            resetPasswordHandler(values as IResetPasswordData);
          }}
          validationSchema={fieldValidationSchema}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              {/* Mật khẩu */}
              <TextInput
                inputsize="large"
                name="password"
                type="password"
                placeholder="Mật khẩu"
                className="mb-5 w-full rounded-md border border-pink-300 p-4 transition duration-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />

              {/* Xác nhận mật khẩu */}
              <TextInput
                inputsize="large"
                name="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="mb-6 w-full rounded-md border border-pink-300 p-4 transition duration-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />

              {/* Nút gửi yêu cầu */}
              <Button
                type="submit"
                size="large"
                block
                fontSize="text-xl"
                fontWeight="font-bold"
                className="w-full rounded-lg bg-pink-600 py-3 text-white transition duration-300 ease-in-out hover:bg-pink-700"
              >
                Gửi yêu cầu
              </Button>
            </form>
          )}
        </Formik>

        {successMessage && (
          <div className="text-center mt-6">
            <p className={`${successMessage.includes('thành công') ? 'text-green-500' : 'text-red-500'}`}>
              {successMessage}
            </p>
          </div>
        )}

        {/* Liên kết */}
        <div className="mt-6 text-center">
          <a href="login" className="font-medium text-pink-500 hover:underline">
            Đã nhớ mật khẩu? Đăng nhập
          </a>
          <span className="mx-2 text-gray-500">•</span>
          <a
            href="register"
            className="font-medium text-pink-500 hover:underline"
          >
            Chưa có tài khoản? Đăng ký
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
