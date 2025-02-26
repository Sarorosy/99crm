import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Dashboard from '../pages/dashboard/Dashboard';


const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
       <Header  />

      {/* Main Content */}
      <main className="flex-1 mx-5 px-2 py-4 ">
       
        <Outlet /> 
        
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-sm py-2 border border-t-1">
        <div className="container mx-auto text-center text-gray-500">
          &copy; {new Date().getFullYear()} Emarketz. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
