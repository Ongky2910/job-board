import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    onLogin(email);
  };

  return (
    <form onSubmit={handleSubmit} className="form-group">
      <label>Email:</label>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        className="form-control" 
      />
      <label>Password:</label>
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="form-control" 
      />
      <button type="submit" className="btn btn-primary mt-2">Login</button>
    </form>
  );
};

export default LoginForm;
