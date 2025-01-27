// src/pages/ManageUser.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { PlusCircle, RefreshCw, Pencil, ChartLine, Trash2 } from 'lucide-react';
import CustomLoader from '../../../components/CustomLoader';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import deletingGIF from '../../../assets/deleting.gif';
import ExportButton from '../../ExportSelectedRows';
import AddUser from './AddUser';
import EditUser from './Edituser';
import { AnimatePresence } from 'framer-motion';



const ManageUser = () => {
  DataTable.use(DT); // Initialize DataTables

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [statisticsVisible, setStatisticsVisible] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);


  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);

  const toggleAddUserVisibility = () => {
    setIsAddingUser(!isAddingUser);
  };
  const toggleEditUserVisibility = () => {
    setIsEditingUser(!isEditingUser);
  };


  const tableRef = useRef(null);
  const navigate = useNavigate();

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://99crm.phdconsulting.in/99crmwebapi/api/users');
      setUsers(response.data.data);
      computeUserStatistics(response.data.data);
      // Store users data in sessionStorage
      sessionStorage.setItem('usersData', JSON.stringify(response.data.data));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  const computeUserStatistics = (users) => {
    const stats = users.reduce((acc, user) => {
      const { user_type, status } = user;
      if (!acc[user_type]) acc[user_type] = { active: 0, inactive: 0 };
      if (status == 1) {
        acc[user_type].active += 1;
      } else {
        acc[user_type].inactive += 1;
      }
      return acc;
    }, {});

    setUserStats(stats);
  };

  const handleDelete = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user to delete");
      return;
    }
    setIsModalOpen(true);
  };
  
  const onConfirmDelete = async () => {
    setIsModalOpen(false);
    setIsDeleting(true); // Show the deleting modal
  
    try {
      const response = await axios.post("https://99crm.phdconsulting.in/99crmwebapi/api/deleteusers", {
        user_ids: selectedUsers,
      });
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)));
      toast.success("Users deleted successfully!");
      setSelectedUsers([]);
      setTimeout(()=>{
        handleRefresh();
      }, 1000)
      
    } catch (error) {
      toast.error("Failed to delete users.");
    } finally {
      setIsDeleting(false); // Hide the deleting modal
      setSelectedUsers([]);

    // Uncheck all checkboxes in the DOM
      document.querySelectorAll(".checkbox").forEach((checkbox) => {
        checkbox.checked = false;
      });
    }
  };
  




  useEffect(() => {
    // Check if users data is present in sessionStorage (cache)
    const cachedUsers = sessionStorage.getItem('usersData');

    if (cachedUsers) {
      const usersData = JSON.parse(cachedUsers);
      setUsers(usersData);
      setLoading(false); // No need to load from the API
      computeUserStatistics(usersData);
    } else {
      // If no cache, fetch from API
      fetchUsers();
      
    }
  }, []);

  // Handle Refresh (Clear Cache and Fetch Fresh Data)
  const handleRefresh = () => {
    sessionStorage.removeItem('usersData'); // Clear cache
    fetchUsers(); // Fetch fresh data
  };

  const toggleStatistics = () => {
    setStatisticsVisible(!statisticsVisible);
  };
  

  // Handle Edit button click
  const handleEditButtonClick = (user) => {
    setSelectedUser(user.id);
    setIsEditingUser(true);
  };

  


  // Function to handle checkbox click
  const handleCheckboxClick = (event, setSelectedUsers) => {
    const userId = $(event.target).data('id'); // Correctly get data-id from checkbox
    console.log('User ID:', userId);
  
    if ($(event.target).is(':checked')) {
      setSelectedUsers((prev) => {
        const updatedSelectedUsers = [...prev, userId];
        console.log('Selected Users (after adding):', updatedSelectedUsers);
        return updatedSelectedUsers;
      });
    } else {
      setSelectedUsers((prev) => {
        const updatedSelectedUsers = prev.filter((id) => id !== userId);
        console.log('Selected Users (after removing):', updatedSelectedUsers);
        return updatedSelectedUsers;
      });
    }
  };

  // Columns definition
  const columns = [
    {
      title: 'Sel',
      data: 'id',
      width:'50px',
      orderable: false,
      render: (data) => {
        const isChecked = selectedUsers.includes(data.id);
        return `
          <div style="width:30px;"><input
            class="checkbox"
            type="checkbox"
            ${isChecked ? 'checked' : ''}
            data-id="${data}"
            
          />
          </div>
        `;
      },
    },    
    {
      title: 'Sr No.',
      data: null,
      orderable: false,
      width: '40px',
      render: (data, type, row, meta) => meta.row + 1, // Serial number
    },
    { title: 'Name', data: 'name', width: '130px',orderable: false, },
    { title: 'Username', data: 'username',orderable: false, },
    { title: 'Email', data: 'email_id' ,orderable: false,},
    { title: 'Password', data: 'password', width: '100px',orderable: false, },
    {
      title: 'User Type',
      data: null, // Use null because we are customizing the content
      width: '150px',
      orderable: false,
      render: function(data, type, row) {
        if (row.user_type == 'user') {
          return `
            <div class="ut">
              ${row.user_type} 
              <br />
              <span style="color: gray; font-size: 12px;">${row.crmRoleType} </span>
            </div>
          `;
        }
        return `
          <div>
            ${row.user_type} 
            
          </div>
        `;
      }
    },
    {
      title: 'Status',
      data: 'status',
      width: '80px',
      orderable: false,
      render: (data, type, row) => {
        const statusText = data == 1 ? 'Active' : 'Inactive';
        const statusColor = data == 1 ? 'green' : 'red';
        const statusBg = data == 1 ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300';
        return `
          <span
        style="color:${statusColor}; cursor: pointer; display: inline-block; text-align: center; width: 70%;"
        class="status-toggle p-1 rounded ${statusBg}"
        data-id="${row.id}"
      >
            ${statusText}
          </span>
        `;
      },
    },
    
    {
      title: 'Current Status',
      data: 'current_status',
      width: '80px',
      orderable: false,
      render: (data) => {
        return data == 'Present' ? (
          `<span style="color: #3c8dbc">Present</span>`
        ) : (
          `<span style="color: red">Absent</span>`
        );
      },
    },
    {
      title: 'Created On',
      data: 'created_on',
      render: (data) => {
        const date = new Date(data * 1000);
        return date.toLocaleDateString('en-US'); // MM/DD/YYYY format
      },
    },
    {
      title: 'Actions',
      data: null,
      orderable: false,
      render: (data, type, row) => {
        return `
          <button class="edit-btn btn btn-sm mx-1" data-id="${row.id}">
            <img src="https://99crm.phdconsulting.in/public/images/edit.gif" alt="edit" />
          </button>
        `;
      },
    },
  ];
  
  const clearSelectedUsers = (newSelectedUsers) => {
    setSelectedUsers([]);  // Clear selected users
  };

  return (
    <div className="">
      <ToastContainer />
      <div className="my-3 flex justify-between">
        <h1 className=" text-xl font-bold">Users List</h1>
        <div className='flex items-center'>
          <button
            className="bg-blue-500 text-white py-1 px-2 rounded flex items-center"
            onClick={toggleStatistics}
            style={{ marginRight: "8px" }}
          >
            <ChartLine className="mr-2" size={14}/>
            {statisticsVisible ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button
            onClick={handleDelete}
            className=" bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-3 flex items-center"
          >
            <Trash2 className='mr-2' size={14}/>Delete
          </button>
          <div className='mr-3'>
          <ExportButton selectedUsers={selectedUsers} users={users}  clearSelectedUsers={clearSelectedUsers}/>
          </div>
          <button
           // onClick={() => navigate('/manageuser/adduser/')}
           onClick={toggleAddUserVisibility}
            className="text-white py-1 px-2 rounded btn btn-warning flex items-center mr-3"
            style={{ marginRight: "8px" }}
          >
            <PlusCircle className="mr-2"  size={14}/>
            Add User
          </button>
          <button
            onClick={handleRefresh}
            className="text-white py-1 px-2 rounded bg-gray-500 hover:bg-gray-600 flex items-center "
          >
            <RefreshCw className="mr-2"  size={14}/>
            Refresh
          </button>
        </div>
      </div>

      {/* DataTable */}
      {loading ? (
        <CustomLoader />
      ) : (
        <div className='px-3 py-2 shadow-xl rounded border-t-2 border-blue-400 bg-white'>

          {statisticsVisible && (
            <div className="px-4 py-2 mb-4 bg-gray-100 shadow-md rounded flex justify-evenly">
              {Object.keys(userStats).map(userType => (
                <div key={userType} className="p-3 bg-white shadow rounded sslist">
                  <h3 className="text-sm font-semibold text-left text-blue-400">{userType}</h3>
                  <div className="flex flex-col font-light">
                    <div className='fsm'>
                      <strong>Total:</strong> {(userStats[userType]?.active || 0) + (userStats[userType]?.inactive || 0)}
                    </div>
                    <div className='fsm'>
                      <strong>Active:</strong> {userStats[userType]?.active || 0}
                    </div>
                    <div className='fsm'>
                      <strong>Inactive:</strong> {userStats[userType]?.inactive || 0}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
          <div className='useractinact'>
          <DataTable
            data={users}
            columns={columns}
            options={{
              searching: true,
              paging: true,
              ordering: true,
              createdRow: (row, data, dataIndex) => {
                $(row).find('.edit-btn').on('click', () => handleEditButtonClick(data));
                $(row).find('.checkbox').on('click', (event) =>
                  handleCheckboxClick(event, setSelectedUsers)
                );
                $(row).find('.status-toggle').on('click', async (event) => {
                  const userId = $(event.target).data('id');
                  try {
                    const response = await axios.post(
                      'https://99crm.phdconsulting.in/99crmwebapi/api/togglestatus',
                      { id: userId }
                    );
                    toast.success(`Status updated successfully!`);
                    handleRefresh(); // Refresh data to reflect changes
                  } catch (error) {
                    console.error('Error toggling status:', error);
                    toast.error('Failed to update status.');
                  }
                });
              },
            }}
          />
          </div>
        </div>
      )}
      {isModalOpen && (
      <ConfirmationModal
        context={{
          title: "Confirm Deletion",
          message: `Are you sure you want to delete ${selectedUsers.length} user(s)?`,
        }}
        isReversible={false}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmDelete}
      />
    )}
      
      <AnimatePresence>
      {isAddingUser && <AddUser onClose={toggleAddUserVisibility} after={handleRefresh}/>}
      {isEditingUser && <EditUser onClose={toggleEditUserVisibility} after={handleRefresh} id={selectedUser}/>}
      </AnimatePresence>
    </div>
  );
};

export default ManageUser;
