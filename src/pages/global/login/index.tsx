import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { responsiveFontSizes } from '@mui/material/styles';


const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/');
      console.log('login success');
    } catch (err) {
      setError('Email hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-50">
      {/* Logo */}
      <h1 className="mb-8 text-5xl font-extrabold text-pink-600">PinkPonk</h1>

      {/* Login Form */}
      <div className="w-96 rounded-2xl border border-pink-300 bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-xl font-semibold text-gray-700">
          Đăng nhập PinkPonk
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Input Fields */}
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Email hoặc số điện thoại"
            className="mb-5 w-full rounded-md border border-pink-300 p-4 transition duration-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Mật khẩu"
            className="mb-6 w-full rounded-md border border-pink-300 p-4 transition duration-300 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-pink-600 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-pink-700"
          >
            Đăng nhập
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center">
          <a
            href="/forgot-password"
            className="font-medium text-pink-500 hover:underline"
          >
            Bạn quên mật khẩu?
          </a>
          <span className="mx-2 text-gray-500">•</span>
          <a
            href="/register"
            className="font-medium text-pink-500 hover:underline"
          >
            Đăng ký PinkPonk
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
