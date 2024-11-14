import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from './common/Input';
import Logo from './common/Chill';
import clsx from 'clsx';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <div className="max-w-md mx-auto p-8 rounded-lg flex flex-col items-center bg-gray-100 shadow-md">
      <Logo src="src/assets/Logo (1).png" className="mb-4" />
      <h2 className="text-2xl font-bold text-center text-white mb-6">Masuk</h2>
      <form>

      <InputField
        id="username"
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Masukkan username"
        className={clsx(username === '' && 'border-red-500')} 
      />

      <InputField
        id="password"
        label="Kata Sandi"
        type={isPasswordVisible? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Masukkan kata sandi"
        showToggle={true}
        toggleVisibility={togglePasswordVisibility}
        
        className={clsx(password === '' && 'border-red-500')} 
      />

<button
        className="w-full text-white py-2 mt-4 rounded-3xl"
        type="submit"
      >
        Masuk
      </button>
      </form>
    </div>
  );
};


export default LoginForm;