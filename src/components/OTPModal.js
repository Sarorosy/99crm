import React, { useState } from 'react';
import axios from 'axios';

import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX } from 'lucide-react';
import { ScaleLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

const OTPModal = ({ setIsOTPVerified, closeModal }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const username = sessionStorage.getItem('username'); // Retrieve username from sessionStorage
      const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/validate-otp', {
        username,
        otp_code: otp,
      });

      if (response.data.status) {
        // Store all user data in sessionStorage
        const user = response.data.user;
      sessionStorage.setItem('id', user.id);
      sessionStorage.setItem('name', user.name);
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem('password', user.password);
      sessionStorage.setItem('email', user.email_id);
      sessionStorage.setItem('mobile_no', user.mobile_no);
      sessionStorage.setItem('sms_notify', user.sms_notify);
      sessionStorage.setItem('user_type', user.user_type);
      sessionStorage.setItem('crmRoleType', user.crmRoleType);
      sessionStorage.setItem('crm_account_type', user.crm_account_type);
      sessionStorage.setItem('created_on', user.created_on);
      sessionStorage.setItem('status', user.status);
      sessionStorage.setItem('download_option', user.download_option);
      sessionStorage.setItem('download_all', user.download_all);
      sessionStorage.setItem('last_visits', user.last_visits);
      sessionStorage.setItem('notification', user.notification);
      sessionStorage.setItem('allocated_to', user.allocated_to);
      sessionStorage.setItem('whatsaap_notification', user.whatsaap_notification);
      sessionStorage.setItem('team_id', user.team_id);
      sessionStorage.setItem('Website_id', user.Website_id);
      sessionStorage.setItem('category', user.category);
      sessionStorage.setItem('set_order', user.set_order);
      sessionStorage.setItem('campaign_type', user.campaign_type);
      sessionStorage.setItem('current_status', user.current_status);
      sessionStorage.setItem('backup_user', user.backup_user);
      sessionStorage.setItem('manager_id', user.manager_id);
      sessionStorage.setItem('disabledQuery', user.disabledQuery);
      sessionStorage.setItem('accessQuoteApproval', user.accessQuoteApproval);
      sessionStorage.setItem('accessQuoteEdit', user.accessQuoteEdit);
      sessionStorage.setItem('accessWebsite', user.accessWebsite);
      sessionStorage.setItem('accessQueryShiftComment', user.accessQueryShiftComment);
      sessionStorage.setItem('accessQueryTransRepliShift', user.accessQueryTransRepliShift);
      sessionStorage.setItem('accessPriceQuote', user.accessPriceQuote);
      sessionStorage.setItem('accessQueryDelete', user.accessQueryDelete);
      sessionStorage.setItem('accessData', user.accessData);
      sessionStorage.setItem('accessOpenspace', user.accessOpenspace);
      sessionStorage.setItem('device_token', user.device_token);
      sessionStorage.setItem('device_token_crm', user.device_token_crm);
      sessionStorage.setItem('otp_code', user.otp_code);
      sessionStorage.setItem('web_otp', user.web_otp);
      sessionStorage.setItem('otp_requested_status', user.otp_requested_status);
      sessionStorage.setItem('otp_requested_date_time', user.otp_requested_date_time);
      sessionStorage.setItem('verifyotp', user.verifyotp);
      sessionStorage.setItem('app_login_time', user.app_login_time);
      sessionStorage.setItem('app_logout_time', user.app_logout_time);
      sessionStorage.setItem('isAuthenticated',true);

        // Display success toast notification
        toast.success('OTP validated successfully. Login completed!');

        // OTP is valid, mark as verified and close the modal
        
        setTimeout(()=>{
            setIsOTPVerified(true);
            if(sessionStorage.getItem('user_type') == "admin"){
              navigate('/')
            }else if(sessionStorage.getItem('user_type') == "user"){
              navigate('/dashboard')
            }else if(sessionStorage.getItem('user_type') == "Accountant"){
              navigate('/payment-milestone')
            }else if(sessionStorage.getItem('user_type') == "Campaign Manager"){
              navigate('/camp-history')
            }else if(sessionStorage.getItem('user_type') == "Data Manager"){
              navigate('/queryhistory')
            }else if(sessionStorage.getItem('user_type') == "sub-admin"){
              navigate('/dashboard')
            }else{
              navigate('/')
            }
           
            closeModal();
        },2000)
       
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('OTP verification failed. Please try again.');
    }finally {
        setIsLoading(false); // Reset loading state after the request completes
      }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg relative otpform">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 cremove"
          onClick={closeModal}
        >
          <CircleX />
        </button>
        <h2 className="font-semibold text-center mb-4">Enter OTP</h2>
        {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
        <form onSubmit={handleOTPSubmit} className="space-y-4">
          <div>
            {/* <label htmlFor="otp" className="block text-sm font-medium text-gray-600">OTP</label> */}
            <input
              type="text"
              id="otp"
              placeholder='OTP'
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className='flex items-center justify-end w-full buton'>
          <button disabled={isLoading} type="submit" className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600">{isLoading ? (
               <ScaleLoader
               color="#ffffff" 
               height={15}      
               width={4}       
               radius={2}       
               margin={3}       
               speedMultiplier={1} 
             />
            ) : (
              'Verify OTP'
            )} &nbsp;<i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
};

export default OTPModal;
