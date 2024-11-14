import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/LoginForm';
import RegisterForm from '../../components/RegisterForm';


const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-white text-xl mb-4">Welcome to Home Page</h1>
      <div className="space-y-4">
        <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          Go to Login
        </Link>
        <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg">
          Go to Register
        </Link>
      </div>
    </div>
  );
};

export default Home;