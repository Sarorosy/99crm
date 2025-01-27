import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [masterDropdownOpen, setMasterDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate(); // useNavigate hook for navigation

  const toggleDropdown = () => {
    
    setDropdownOpen(!dropdownOpen);
    setMasterDropdownOpen(false); 
    setUserMenuOpen(false); 
  };

  const toggleMasterDropdown = () => {
    
    setMasterDropdownOpen(!masterDropdownOpen);
    setDropdownOpen(false); 
    setUserMenuOpen(false); 
  };
  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage
    navigate('/login')
    
  };
  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const email = sessionStorage.getItem('email');
    const name = sessionStorage.getItem('name');

    // If username, email, and name are available in sessionStorage, user is authenticated
    if (username && email && name) {
     
    } else {
      navigate('/login')
    }
  }, []);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setDropdownOpen(false); 
    setMasterDropdownOpen(false); 
  };

  // Get the logged-in user's name from sessionStorage
  const userName = sessionStorage.getItem('name');

  const handleNavigation = (path) => {
    setDropdownOpen(false);
    setMasterDropdownOpen(false);
    setUserMenuOpen(false);
    navigate(path); // useNavigate hook to navigate to the path
  };

  return (
    <header className="bg-blue-400 text-white">
      <div className="mx-auto w-full flex justify-between items-center px-5">
        {/* Logo and Navigation Links */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-6 bg-[#f39c12] py-3 px-2">Query Management</h1>
          <nav className="flex space-x-6">
            <button onClick={() => handleNavigation('/')} className="">
              Dashboard
            </button>
            <button onClick={() => handleNavigation('/manageuser')} className="">
              Manage User
            </button>

            {/* Query Management Dropdown */}
            <div className="relative z-50">
              <button
                onClick={toggleDropdown}
                className=""
              >
                Manage Query
              </button>
              {dropdownOpen && (
                <div className="absolute bg-white text-black shadow-md mt-3 border  p-2 w-60 ">
                  <button onClick={() => handleNavigation('/queryhistory')} className="block px-4 py-2  w-full dropdownmenu">Query History</button>
                  
                  <button onClick={() => handleNavigation('/addquery')} className="block px-4 py-2  w-full dropdownmenu">Add Query</button>

                  <button onClick={() => handleNavigation('/addboxquery')} className="block px-4 py-2  w-full dropdownmenu">Add Box Query</button>
                  
                  <button onClick={() => handleNavigation('/import-query')} className="block px-4 py-2  w-full dropdownmenu">Import Query</button>

                  <button onClick={() => handleNavigation('/camp-history')} className="block px-4 py-2  w-full dropdownmenu">Camp History</button>
                  
                  <button onClick={() => handleNavigation('/reminder-query')} className="block px-4 py-2  w-full dropdownmenu">Reminder Query</button>
                 
                  <button onClick={() => handleNavigation('/boxquery')} className="block px-4 py-2  w-full dropdownmenu">Box Query</button>
                  
                  <button onClick={() => handleNavigation('/dead-query')} className="block px-4 py-2  w-full dropdownmenu">Dead Query</button>
                  
                  <button onClick={() => handleNavigation('/userdataspecificquery')} className="block px-4 py-2  w-full dropdownmenu">User Data Specific Query</button>
                </div>
              )}
            </div>

            {/* Master Data Dropdown */}
            <div className="relative z-50 ">
              <button
                onClick={toggleMasterDropdown}
                className=""
              >
                Master Data
              </button>
              {masterDropdownOpen && (
                <div className="absolute bg-white text-black shadow-md mt-3 border p-2 w-60 ">
                  <button onClick={() => handleNavigation('/followupsetting')} className="block px-4 py-2  w-full dropdownmenu">Follow Up Setting</button>
                  
                  <button onClick={() => handleNavigation('/teams')} className="block px-4 py-2  w-full dropdownmenu">Teams</button>
                  
                  <button onClick={() => handleNavigation('/quote-history')} className="block px-4 py-2  w-full dropdownmenu">Quote History</button>
                  
                  <button onClick={() => handleNavigation('/email-template')} className="block px-4 py-2  w-full dropdownmenu">Email Template</button>
                  
                  <button onClick={() => handleNavigation('/quote-template')} className="block px-4 py-2  w-full dropdownmenu">Quote Template</button>
                  
                  <button onClick={() => handleNavigation('/email-campaign')} className="block px-4 py-2  w-full dropdownmenu">Email Campaign</button>
                  
                  <button onClick={() => handleNavigation('/website-list')} className="block px-4 py-2  w-full dropdownmenu">Website List</button>
                  
                  <button onClick={() => handleNavigation('/whatsapp-template')} className="block px-4 py-2  w-full dropdownmenu">WhatsApp Template</button>
                
                  <button onClick={() => handleNavigation('/tags')} className="block px-4 py-2   w-full dropdownmenu">Tags</button>
                  
                  <button onClick={() => handleNavigation('/box-tags')} className="block px-4 py-2   w-full dropdownmenu">Box Tags</button>
                  
                  <button onClick={() => handleNavigation('/reports')} className="block px-4 py-2   w-full dropdownmenu">Reports</button>
                  
                  <button onClick={() => handleNavigation('/request-quote-activation')} className="block px-4 py-2  w-full dropdownmenu" >Request Quote Activation</button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* User Session Info */}
        <div className="relative z-50">
          <button
            onClick={toggleUserMenu}
            className="text-white "
          >
            {userName}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 bg-white text-black shadow-md mt-3 border p-2 w-52">
              <button onClick={() => handleNavigation('/changepassword')} className="block rounded px-4 py-2 w-full dropdownmenu">Change Password</button>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left hover:bg-red-400 rounded hover:text-white dropdownmenu"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
