import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout'; // Import Layout
import ManageUser from './pages/module/user/ManageUser';
import './output.css';
import './index.css';
import AddUser from './pages/module/user/AddUser';
import EditUser from './pages/module/user/Edituser';
import ManageFollowupSetting from './pages/module/masterdata/followupsetting/ManageFollowupSetting';
import ManageTeams from './pages/module/masterdata/teams/ManageTeams';
import QuoteHistory from './pages/module/pricequote/QuoteHistory';
import ManageEmailTemplate from './pages/module/masterdata/emailtemplate/ManageEmailTemplate';
import ManageQuoteTemplate from './pages/module/masterdata/quotetemplate/ManageQuoteTemplate';
import ManageWebsite from './pages/module/masterdata/websitelist/ManageWebsite';
import ManageWhatsappTemplate from './pages/module/masterdata/whatsapptemplate/ManageWhatsappTemplate';
import ManageTags from './pages/module/masterdata/tags/ManageTags';
import ManageBoxTags from './pages/module/masterdata/boxtags/ManageBoxTags';
import ManageReports from './pages/module/masterdata/reports/ManageReports';
import RequestQuoteActivation from './pages/module/pricequote/RequestQuoteActivation';
import ManageEmailCampaign from './pages/module/masterdata/emailcampaign/ManageEmailCampaign';
import UserQuery from './pages/managequery/UserQuery';
import AddQuery from './pages/managequery/AddQuery';
import AddBoxQuery from './pages/managequery/AddBoxQuery';
import ImportQuery from './pages/managequery/ImportQuery';
import BoxQuery from './pages/managequery/BoxQuery';
import RemainderQuery from './pages/managequery/RemainderQuery';
import CampHistory from './pages/managequery/CampHistory';
import DeadQuery from './pages/managequery/DeadQuery';
import UserDataSpecificQuery from './pages/managequery/UserDataSpecificQuery';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/dashboard/Dashboard';
import ClientMailPage from './pages/managequery/mail/ClientEmailPage';
import ManageProfile from './pages/module/manageprofile/ManageProfile';
import QuerySummary from './pages/managequery/QuerySummary';
import ManagePayment from './pages/module/payments/ManagePayment';
import ChangePassword from './pages/ChangePassword';
import ManageValidationQuery from './pages/module/validation/ManageValidationQuery';
import ManageWorkSpace from './pages/module/workspace/ManageWorkSpace';
import PaymentMilestones from './pages/module/pricequote/PaymentMilestones';
import MilestonePayments from './pages/module/pricequote/MilestonePayments';
import HoldQuery from './pages/managequery/HoldQuery';
import ManageDailyWorkStatus from './pages/module/user/ManageDailyWorkStatus';
import OpenQuery from './pages/managequery/openquery/OpenQuery';
import StrikeRate from './pages/module/masterdata/strikerate/StrikeRate';
import ManageStrikeRate from './pages/module/masterdata/strikerate/ManageStrikeRate';

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check sessionStorage on initial load to determine if user is authenticated
  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const email = sessionStorage.getItem('email');
    const name = sessionStorage.getItem('name');



    // If username, email, and name are available in sessionStorage, user is authenticated
    if (username && email && name) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage
    setIsAuthenticated(false); // Update the authentication state

  };
  //basename='/Saravanan/99crm'
  return (
    <Router >
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <Layout />
          }
        >
          {/* Add the ManageUser route */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manageuser" element={<ManageUser />} />
          <Route path="/manageuser/adduser" element={<AddUser />} />
          <Route path="/manageuser/edituser/:id" element={<EditUser />} />


          <Route path="/manageprofile" element={<ManageProfile />} />
          <Route path="/querysummary" element={<QuerySummary />} />
          <Route path="/payments" element={<ManagePayment />} />

          <Route path="/followupsetting" element={<ManageFollowupSetting />} />
          <Route path="/teams" element={<ManageTeams />} />

          <Route path="/validation" element={<ManageValidationQuery />} />
          <Route path="/quote-history" element={<QuoteHistory />} />
          <Route path="/payment-milestone" element={<PaymentMilestones />} />
          <Route path="/milestone-payments" element={<MilestonePayments />} />
          <Route path="/daily-work-status" element={<ManageDailyWorkStatus />} />
          <Route path="/email-template" element={<ManageEmailTemplate />} />
          <Route path="/email-campaign" element={<ManageEmailCampaign />} />
          <Route path="/quote-template" element={<ManageQuoteTemplate />} />
          <Route path="/website-list" element={<ManageWebsite />} />
          {/* <Route path="/whatsapp-template" element={<ManageWhatsappTemplate />} /> */}
          <Route path="/tags" element={<ManageTags />} />
          <Route path="/box-tags" element={<ManageBoxTags />} />
          <Route path="/reports" element={<ManageReports />} />
          <Route path="/request-quote-activation" element={<RequestQuoteActivation />} />

          <Route path="/queryhistory" element={<UserQuery />} />
          <Route path="/holdquery" element={<HoldQuery />} />
          <Route path="/openquery" element={<OpenQuery />} />
          <Route path="/strikerate" element={<StrikeRate />} />
          <Route path="/managestrikerate" element={<ManageStrikeRate />} />
          <Route path="/addquery" element={<AddQuery />} />
          <Route path="/addboxquery" element={<AddBoxQuery />} />
          <Route path="/import-query" element={<ImportQuery />} />
          <Route path="/boxquery" element={<BoxQuery />} />
          <Route path="/reminder-query" element={<RemainderQuery />} />
          <Route path="/camp-history" element={<CampHistory />} />
          <Route path="/dead-query" element={<DeadQuery />} />
          <Route path="/userdataspecificquery" element={<UserDataSpecificQuery />} />
          <Route path="/client-mail" element={<ClientMailPage />} />
          {/* <Route path="/changepassword" element={<ChangePassword />} /> */}


          <Route path="/workspace" element={<ManageWorkSpace />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        // Define default options
        className: 'border',
        duration: 3000,
        removeDelay: 500,
        style: {
          background: '#161616FF',
          color: '#fff',
        },

        // Default options for specific types
        success: {
          duration: 3000,
          iconTheme: {
            primary: 'green',
            secondary: 'black',
          },
        },
      }} />
    </Router>
  );
};

export default App;
