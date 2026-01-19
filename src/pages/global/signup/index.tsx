import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { TextInput } from '../../../components/atoms/input/TextInput';
import { useAuth } from '../../../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/');
    }
  });

  const fieldValidationSchema = yup.object({
    fullName: yup.string().required('Tên đầy đủ là bắt buộc'),
    email: yup
      .string()
      .email('Email không hợp lệ')
      .required('Email là bắt buộc'),
    username: yup.string().required('Tên đăng nhập là bắt buộc'),
    phoneNumber: yup.string().required('Số điện thoại là bắt buộc'),
    password: yup
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .required('Mật khẩu là bắt buộc'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Mật khẩu không khớp')
      .required('Xác nhận mật khẩu là bắt buộc'),
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-50">
      <div className="h-auto w-96 rounded-2xl border border-pink-300 bg-white p-8 shadow-2xl">
        <h1 className="mb-8 text-center text-5xl font-extrabold text-pink-600">
          PinkPonk
        </h1>

        <Formik
          initialValues={{
            fullName: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
          }}
          onSubmit={async (values, { setSubmitting }) => {
            
            try {
              await register({
                fullName: values.fullName,
                email: values.email,
                username: values.username,
                password: values.password,
                confirmPassword: values.confirmPassword,
                phoneNumber: values.phoneNumber,
              });
              navigate('/');
            } catch (err: any) {
              console.log(err);
              setError(err);

            } finally {
              setSubmitting(false);
            }
          }}
          validationSchema={fieldValidationSchema}
        >
          {({ handleSubmit, isSubmitting, errors }) => {
            return (
              <Form onSubmit={handleSubmit}>
                {/* Tên đầy đủ */}
                <TextInput
                  inputsize="large"
                  type="text"
                  placeholder="Tên đầy đủ"
                  name="fullName"
                  className="mb-5 w-full rounded-md border border-pink-300 p-4 transition duration-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                {/* Email */}
                <TextInput
                  inputsize="large"
                  type="email"
                  placeholder="Email"
                  name="email"
                  className="mb-5 w-full rounded-md border border-pink-300 p-4 transition duration-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                {/* Tên đăng nhập */}
                <TextInput
                  inputsize="large"
                  type="text"
                  placeholder="Tên đăng nhập"
                  name="username"
                  className="mb-5 w-full rounded-md border border-pink-300 p-4 transition duration-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

                {/* Số điện thoại */}
                <TextInput
                  inputsize="large"
                  type="text"
                  placeholder="Số điện thoại"
                  name="phoneNumber"
                  className="mb-5 w-full rounded-md border border-pink-300 p-4 transition duration-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />

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
                {error && <p className="text-red-500 mb-6">{error}</p>}
                {/* Nút đăng ký */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-pink-600 py-3 text-white transition duration-300 ease-in-out hover:bg-pink-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
              </Form>
            );
          }}
        </Formik>

        {/* Liên kết */}
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="font-medium text-pink-500 hover:underline"
          >
            Bạn đã có tài khoản? Đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
