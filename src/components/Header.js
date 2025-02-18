import { CircleUserRound, File, Bell, Mail, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import QueryDetails from '../pages/managequery/QueryDetails';

const Header = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRefId, setSelectedRefId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [masterDropdownOpen, setMasterDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showNoti, setShowNoti] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [notifications, setNotifications] = useState({
    TotalNoti: 0,
    arrayNoti: [],
    ClientTotalUnraed: 0,
    totalAttacheFile: 0,
    attachedFilesarray: []
  });


  const navigate = useNavigate(); // useNavigate hook for navigation
  const userType = sessionStorage.getItem("user_type");
  if (!userType) {
    navigate("/login")
  }

  const toggleDropdown = () => {

    setDropdownOpen(!dropdownOpen);
    setMasterDropdownOpen(false);
    setUserMenuOpen(false);
  };
  const fetchNotifications = async () => {
    const payload = {
      user_type: sessionStorage.getItem('user_type'),
      user_id: sessionStorage.getItem('id'),
      team_id: sessionStorage.getItem('team_id')
    };

    try {
      const response = await fetch('https://99crm.phdconsulting.in/api/common-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setNotifications({
        TotalNoti: data.TotalNoti,
        arrayNoti: data.arrayNoti,
        ClientTotalUnraed: data.ClientTotalUnraed,
        totalAttacheFile: data.totalAttacheFile,
        attachedFilesarray: data.attachedFilesarray
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const email = sessionStorage.getItem('email');
    const name = sessionStorage.getItem('name');

    if (username && email && name) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 120000);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    } else {
      navigate('/login');
    }
  }, []);

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

  const handleViewButtonClick = (data) => {
    setSelectedRefId(data);
    setDetailsOpen(true);
  }

  return (
    <header className="navv">
      <div className="w-full flex justify-between items-center container">
        {/* Logo and Navigation Links */}
        <div className="flex items-center">
          <div className="relative inline-block">
            <h1 className="text-xl font-bold relative mr-6 theme1 py-3 px-4 young-serif">
              99 CRM <span className="logospan text-xs text-blue-950 font-bold">®</span>
            </h1>

          </div>

          <nav className="flex space-x-6">
            {userType == "Campaign Manager" ? (
              <button onClick={() => handleNavigation('/camp-history')} className="">
                Camp History
              </button>
            ) : userType == "Accountant" ? (
              <button onClick={() => handleNavigation('/payment-milestone')} className="">
                Payment Milestone
              </button>
            ) : userType == "Data Manager" ? (
              <button onClick={() => handleNavigation('/queryhistory')} className="">
                Query History
              </button>
            ) : (
              <button onClick={() => handleNavigation('/dashboard')} className="">
                Dashboard
              </button>
            )}
            {(userType === "Accountant" || userType === "user") && (
              <button onClick={() => handleNavigation('/payments')} >
                Payments
              </button>
            )}


            {(userType == 'admin' || userType == "sub-admin") ? (
              <button onClick={() => handleNavigation('/manageuser')} className="">
                Manage User
              </button>
            ) : null}

            {userType == "sub-admin" ? (
              <button onClick={() => handleNavigation('/manageprofile')} className="">
                Manage Profile
              </button>
            ) : null}


            {(userType != "Campaign Manager" && userType != "Accountant") && (
              <>
                <div className="relative z-50">
                  <button
                    onClick={toggleDropdown}
                    className=""
                  >
                    Manage Query
                  </button>
                  {dropdownOpen && (
                    <div className="absolute bg-white text-black shadow-md mt-3 border  p-2 wnav ">

                      {userType == "Data Manager" ? (
                        <>
                          <button onClick={() => handleNavigation('/addquery')} className="block px-4 py-2  w-full dropdownmenu">Add Query</button>

                          <button onClick={() => handleNavigation('/addboxquery')} className="block px-4 py-2  w-full dropdownmenu">Add Box Query</button>

                          <button onClick={() => handleNavigation('/import-query')} className="block px-4 py-2  w-full dropdownmenu">Import Query</button>
                        </>
                      ) : userType != "Operations Manager" ? (
                        <>

                          <button onClick={() => handleNavigation('/queryhistory')} className="block px-4 py-2  w-full dropdownmenu">Query History</button>

                          <button onClick={() => handleNavigation('/addquery')} className="block px-4 py-2  w-full dropdownmenu">Add Query</button>

                          <button onClick={() => handleNavigation('/addboxquery')} className="block px-4 py-2  w-full dropdownmenu">Add Box Query</button>

                          <button onClick={() => handleNavigation('/import-query')} className="block px-4 py-2  w-full dropdownmenu">Import Query</button>

                          {userType == "Data Manager" || userType == "sub-admin" || userType == "admin" && (
                            <button onClick={() => handleNavigation('/camp-history')} className="block px-4 py-2  w-full dropdownmenu">Camp History</button>
                          )}

                          <button onClick={() => handleNavigation('/reminder-query')} className="block px-4 py-2  w-full dropdownmenu">Reminder Query</button>

                          <button onClick={() => handleNavigation('/boxquery')} className="block px-4 py-2  w-full dropdownmenu">Box Query</button>

                          <button onClick={() => handleNavigation('/dead-query')} className="block px-4 py-2  w-full dropdownmenu">Dead Query</button>
                          {userType == "admin" && (
                            <button onClick={() => handleNavigation('/userdataspecificquery')} className="block px-4 py-2  w-full dropdownmenu bbnone">User Data Specific Query</button>

                          )}
                          {userType == "sub-admin" && (
                            <button onClick={() => handleNavigation('/querysummary')} className="block px-4 py-2  w-full dropdownmenu bbnone">Query Summary</button>
                          )}

                        </>
                      ) :

                        (
                          <>
                          <button onClick={() => handleNavigation('/queryhistory')} className="block px-4 py-2  w-full dropdownmenu">Query History</button>
                          </>
                        )}
                    </div>
                  )}
                </div>
                {userType != "Operations Manager" && (
                  <>
                    <div className="relative z-50 ">
                      <button
                        onClick={toggleMasterDropdown}
                        className=""
                      >
                        Master Data
                      </button>
                      {masterDropdownOpen && (
                        <div className="absolute bg-white text-black shadow-md mt-3 border p-2 w-60 ">
                          {userType == "admin" && (
                            <>
                              <button onClick={() => handleNavigation('/followupsetting')} className="block px-4 py-2  w-full dropdownmenu">Follow Up Setting</button>

                              <button onClick={() => handleNavigation('/teams')} className="block px-4 py-2  w-full dropdownmenu">Teams</button>

                            </>
                          )}
                          {(userType == "sub-admin" || userType == "admin" || userType == "user") && (
                            <>
                              {(userType != "sub-admin" || sessionStorage.getItem("accessPriceQuote") == "Yes") && (
                                <button onClick={() => handleNavigation('/quote-history')} className="block px-4 py-2 w-full dropdownmenu">
                                  Quote History
                                </button>
                              )}


                              <button onClick={() => handleNavigation('/email-template')} className="block px-4 py-2  w-full dropdownmenu">Email Template</button>

                            </>
                          )}

                          {userType == "admin" || userType == "sub-admin" && (
                            <>
                              <button onClick={() => handleNavigation('/quote-template')} className="block px-4 py-2  w-full dropdownmenu">Quote Template</button>

                              <button onClick={() => handleNavigation('/email-campaign')} className="block px-4 py-2  w-full dropdownmenu">Email Campaign</button>
                            </>
                          )}
                          {sessionStorage.getItem("accessWebsite") == "Yes" && (
                            <button onClick={() => handleNavigation('/website-list')} className="block px-4 py-2  w-full dropdownmenu">Website List</button>

                          )}

                          <button onClick={() => handleNavigation('/whatsapp-template')} className="block px-4 py-2  w-full dropdownmenu">WhatsApp Template</button>

                          <button onClick={() => handleNavigation('/tags')} className="block px-4 py-2   w-full dropdownmenu">Tags</button>

                          <button onClick={() => handleNavigation('/box-tags')} className="block px-4 py-2   w-full dropdownmenu">Box Tags</button>

                          <button onClick={() => handleNavigation('/reports')} className="block px-4 py-2   w-full dropdownmenu">Reports</button>

                          {userType == "admin" || userType == "sub-admin" && (
                            <button onClick={() => handleNavigation('/request-quote-activation')} className="block px-4 py-2  w-full dropdownmenu bbnone" >Request Quote Activation</button>
                          )}


                        </div>
                      )}
                    </div>
                  </>
                )}

              </>
            )}

          </nav>
        </div>

        {/* User Session Info */}
        <div className="relative z-50 flex space-x-2">
          <button
            onClick={() => {
              setShowNoti(false)
              setShowFiles(!showFiles)
            }}
            className="text-green-600 relative px-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200">
            <File size={16}/>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
                  w-5 h-5 rounded-full flex items-center justify-center
                  shadow-lg transform scale-100">
              {notifications.totalAttacheFile}
            </span>
          </button>

          {(userType === "admin" || userType === "user") && (
            <button
              onClick={() => {
                setShowFiles(false)
                setShowNoti(!showNoti)
              }}
              className="text-green-600 relative p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200">
              <Bell size={17}/>
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs 
                  w-5 h-5 rounded-full flex items-center justify-center
                  shadow-lg">
                {notifications.TotalNoti}
              </span>
            </button>
          )}

          {showNoti && (
            <div className="absolute h-96 overflow-y-auto custom-scrollbar top-12 right-10 w-64 bg-white shadow-lg rounded-lg px-2 py-2 z-50">
              <h3 className="font-semibold">You have {notifications.TotalNoti} notifications</h3>
              <ul className="mt-2">
                {notifications.arrayNoti.map((noti, index) => (
                  <li onClick={() => { handleViewButtonClick(noti.ref_id) }} key={index} className=" hover:bg-gray-100 border-b py-2 px-1 text-sm cursor-pointer">
                    <strong>{noti.name}</strong> Ref. No.({noti.ref_id}) <br />
                    <span className="fssx text-gray-500">{noti.email_id}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Floating Attached Files Panel */}
          {showFiles && (
            <div className="absolute top-12 right-24 w-64 bg-white shadow-lg rounded-lg p-3 z-50">
              <h3 className="text-sm font-semibold">You have {notifications.totalAttacheFile} file received.</h3>
              <ul className="mt-2">
                {notifications.attachedFilesarray.map((file, index) => (
                  <li key={index} className="border-b py-2 text-sm">
                    <strong>{file.fileName}</strong> <br />
                    <span className="text-xs text-gray-500">Uploaded by {file.uploadedBy} on {file.uploadedDate}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => { navigate('client-mail') }}
            className="text-green-600 relative p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200">
            <Mail size={17}/>
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs 
                  w-5 h-5 rounded-full flex items-center justify-center
                  shadow-lg font-semibold min-w-[20px]">
                {notifications.ClientTotalUnraed}
              </span>
            </button>

          <button
            onClick={toggleUserMenu}
            className="px-2 py-2 rounded-full transition-all duration-200
                      theme1 text-green-600 
                      hover:text-blue-800 font-medium
                      flex items-center gap-2
                      hover:shadow-md hover:-translate-y-[1px]
                      active:scale-95 active:shadow-sm
                      focus:outline-none focus:ring-blue-500/60
                      border border-blue-200/50"
          >
            <CircleUserRound size={20} className="transition-transform" />
            <span className="truncate max-w-[120px]">{userName}</span>
            <ChevronDown size={16} className="ml-1 opacity-80 transition-transform" />
          </button>
          {userMenuOpen && (
            <div className="absolute top-8 -right-8 bg-white text-black shadow-md mt-3 border p-2 w-52">
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
      <AnimatePresence>
        {detailsOpen && (
          <QueryDetails refId={selectedRefId} onClose={() => setDetailsOpen(!detailsOpen)} />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
