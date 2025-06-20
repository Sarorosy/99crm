import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import axios from 'axios';
import 'select2/dist/css/select2.css';
import 'select2';
import 'daterangepicker/daterangepicker.css';
import 'daterangepicker';
import { RefreshCcw, FilterIcon } from 'lucide-react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import toast from 'react-hot-toast';
import CustomLoader from '../../../../components/CustomLoader';

DataTable.use(DT);

const StrikeRate = () => {
  const selectTeamRef = useRef(null);
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([]);
  const [usersStrikeRate, setUsersStrikeRate] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [strikeSummary, setStrikeSummary] = useState({ low: 0, medium: 0, high: 0 });

  // Initialize Select2 when users change
  useEffect(() => {
    $(selectTeamRef.current)
      .select2({
        placeholder: 'Select User',
        allowClear: true,
      })
      .on('change', function () {
        setSelectedUser($(this).val());
      });

    return () => {
      $(selectTeamRef.current).select2('destroy');
    };
  }, [users]);

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        'https://99crm.phdconsulting.in/zend/99crmwebapi/api/getAllCrmUsers'
      );
      if (response.data.status) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    }
  };

  // Fetch strike rate data with optional filters
  const fetchCrmStrikeRate = async (selected_user = '', status = '') => {
    try {
      setLoading(true);
      const payload = {
        user_id: sessionStorage.getItem('id'),
        user_type: sessionStorage.getItem('user_type'),
        selected_user,
        status,
      };

      const response = await axios.post(
        'https://99crm.phdconsulting.in/zend/api/crmqueryrate',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        setUsersStrikeRate(response.data.usersStrikeRate || []);
        setStrikeSummary(response.data.strikeSummary || {});
      } else {
        toast.error('Failed to fetch strike rate');
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching CRM strike rate data');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters (API-side filtering)
  const fetchFilteredStrikeRate = () => {
    fetchCrmStrikeRate(selectedUser, status);
  };

  // Reset filters and refetch
  const resetFilters = () => {
    setSelectedUser('');
    setStatus('');
    $(selectTeamRef.current).val(null).trigger('change');
    fetchCrmStrikeRate();
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
    fetchCrmStrikeRate();
  }, []);

  const columns = [
    {
      title: 'Name',
      data: 'name',
      orderable: false,
      render: (data) => `<div style="text-align: left;">${data}</div>`,
    },
    {
      title: 'Username',
      data: 'username',
      orderable: false,
      render: (data) => `<div style="text-align: left;">${data}</div>`,
    },
    {
      title: 'Email',
      data: 'email_id',
      orderable: false,
      render: (data) => `<div style="text-align: left;">${data}</div>`,
    },
    {
      title: 'Assigned Query',
      data: 'total_assigned',
      orderable: false,
      render: (data) => `<div style="text-align: left;">${data}</div>`,
    },
    {
      title: 'In Conversation',
      data: 'in_conversation',
      orderable: false,
      render: (data) => `<div style="text-align: left;">${data}</div>`,
    },
    {
      title: 'Strike Rate',
      data: 'strike_rate',
      orderable: false,
      render: (data) => `<div style="text-align: left;">${data}%</div>`,
    },
  ];

  return (
    <div className="container bg-gray-100 w-full add">
      <h1 className="text-xl font-bold">CRM Strike Rate</h1>

      {/* Filter Section */}
      <div className="flex items-center space-x-2 my-4 bg-white p-2 rounded">
        <div className="">
          <select
            id="user_id"
            className="form-control form-control-sm f-12"
            ref={selectTeamRef}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

     <div className="flex items-center space-x-2">
  {['low', 'medium', 'high'].map((level) => {
    const label =
      level === 'low'
        ? '0-40%'
        : level === 'medium'
        ? '40-60%'
        : 'Above 60%';

    const count = strikeSummary[level] || 0;
    const isActive = status === level;

    return (
        <div>
      <button
        key={level}
        className={`btn btn-sm ${
          isActive
            ? 'btn-primary'
            : 'btn-light f-11'
        }`}
        onClick={() => {
          setStatus(level);
        }}
      >
        {label} ({count})
      </button>
      </div>
    );
  })}
<div>
  <button
    className={`btn btn-sm ${
      status === ''
        ? 'btn-primary'
        : 'btn-light f-11'
    }`}
    onClick={() => {
      setStatus('');
    }}
  >
    All ({(strikeSummary.low || 0) + (strikeSummary.medium || 0) + (strikeSummary.high || 0)})
  </button>
  </div>
</div   >


        <div className="w-1/2 flex items-center space-x-2 last">
          <button
            className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 flex items-center"
            onClick={fetchFilteredStrikeRate}
          >
            Apply Filters &nbsp;
            <FilterIcon size={12} />
          </button>
          <button
            className="bg-gray-200 text-gray-500 py-1 px-2 rounded hover:bg-gray-300"
            onClick={resetFilters}
            title="Reset Filters"
          >
            <RefreshCcw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <CustomLoader />
      ) : (
        <div className="bg-white p-2 border-t-2 border-blue-400 rounded">
          <DataTable
            data={usersStrikeRate}
            columns={columns}
            options={{ pageLength: 50 }}
          />
        </div>
      )}
    </div>
  );
};

export default StrikeRate;
