import React from 'react';
import { useMediaQuery } from 'react-responsive';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Homepage = () => {
  const isDesktopOrLaptop = useMediaQuery({ minWidth: 1224 });
  
  return (
    <div>
      <Header />
      <main className="container">
        <h1>{isDesktopOrLaptop ? "Welcome to the Homepage!" : "Welcome!"}</h1>
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;

