import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="bg-primary text-white p-3">
    <nav>
      <Link className="text-white" to="/">Home</Link> | 
      <Link className="text-white ml-3" to="/login">Login</Link> | 
      <Link className="text-white ml-3" to="/register">Register</Link>
    </nav>
  </header>
);

export default Header;
