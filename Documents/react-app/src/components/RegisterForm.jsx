import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from './common/Input';
import Logo from './common/Chill';
import Button from './common/Button'; 


const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-lg">
      <Logo src="src/assets/Logo (1).png" className="mb-4" />
      <h2 className="text-2xl font-bold text-center text-white mb-6">Daftar</h2>
      <form>
      <InputField
        id="username"
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Masukkan username"
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
      />


      <InputField
        id="confirmPassword"
        label="Konfirmasi Kata Sandi"
        type={isPasswordVisible ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Konfirmasi kata sandi"
        showToggle={true}
        toggleVisibility={togglePasswordVisibility} 
       />

       <div className="flex text-sm text-gray-300 mb-4">Sudah punya akun?
       <Link to="/login"className="hover:underline"> Masuk</Link>  
       </div>

      <Button text="Daftar" />
      <Button text="Daftar dengan Google" type="secondary" />
      </form>
      </div>
  );
};

export default RegisterForm;