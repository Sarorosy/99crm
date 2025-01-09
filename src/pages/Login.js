import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPModal from '../components/OTPModal';
import { Frown, Eye, EyeOff } from 'lucide-react';
import { ScaleLoader } from 'react-spinners';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  // Check sessionStorage on initial load to determine if user is authenticated
  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const email = sessionStorage.getItem('email');
    const name = sessionStorage.getItem('name');
    const user_type = sessionStorage.getItem('user_type');

    // If username, email, and name are available in sessionStorage, user is authenticated
    if (username && email && name)  {
      if(user_type == 'Data Manager'){
        navigate('/addquery')
      }
      else{
        navigate('/')
      }
      
    } else {
      
      navigate('/login')
    }
  }, []);


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true
    
    try {
      const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.status) {
          // Store username in sessionStorage for OTP verification
          sessionStorage.setItem('username', username);
          setShowOTPModal(true);
        } else {
          setError(data.message);
        }
      } else {
        const data = await response.json();
        if (response.status === 401) {
          setError('Invalid username or password.');
        } else if (response.status === 403) {
          setError('Account is deactivated. Please contact the administrator.');
        } else {
          setError(data.message || 'An unexpected error occurred.');
        }
      }
    } catch (err) {
      setError('Login failed. Please check your internet connection.');
    } finally {
      setIsLoading(false); // Reset loading state after the request completes
    }
  };

  
  





  return (
    <div className="flex justify-center items-center h-screen bg-indigo-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 bg-red-100 px-2 py-3 rounded flex items-center justify-center">
            {error} <Frown className="ml-2" />
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <span
                className="absolute top-3 right-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </span>
            </div>
          </div>
          <div className='w-full mx-auto flex items-center justify-center'>
          <button
            type="submit"
            className={`w-1/2 mx-auto bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
               <ScaleLoader
               color="#ffffff" 
               height={15}      
               width={4}       
               radius={2}       
               margin={3}       
               speedMultiplier={1} 
             />
            ) : (
              'Login'
            )}
          </button>
          </div>
          
        </form>
      </div>
      {showOTPModal && <OTPModal setIsOTPVerified={setIsOTPVerified} closeModal={() => setShowOTPModal(false)} />}
    </div>
  );
};

export default Login;
