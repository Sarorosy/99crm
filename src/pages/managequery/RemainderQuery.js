import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import { PlusCircle, RefreshCw, Pencil, Trash2, SearchIcon, Plus } from 'lucide-react';
import CustomLoader from '../../components/CustomLoader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import ExportButton from '../ExportSelectedRows';
import ExportButtonQuery from '../ExportSelectedQueries';
import { queries } from '@testing-library/react';


const RemainderQuery = () => {
    DataTable.use(DT);

    const [users, setUsers] = useState([]);
    const [teamUsers, setTeamUsers] = useState([])
    const [reports, setReports] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [status, setStatus] = useState([]);
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [selectedQueries, setSelectedQueries] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [startDate, setStartDate] = useState(null); // Store start date
    const [endDate, setEndDate] = useState(null); // Store end date
    const [searchTeamId, setSearchTeamId] = useState([]);
    const [searchKeywords, setSearchKeywords] = useState("");
    const [refId, setRefId] = useState("");
    const [selectedWebsites, setSelectedWebsites] = useState('');
    const [selectedTags, setSelectedTags] = useState('');
    const [searchType, setSearchType] = useState('');
    const [updateStatus, setUpdateStatus] = useState("");
    const [iconFilter, setIconFilter] = useState("");
    const [transferType, setTransferType] = useState("");
    const [selectedState, setSelectedState] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('')
    const userType = sessionStorage.getItem('user_type');



    const websiteRef = useRef(null);
    const userRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        // Initialize select2 for Select Team
        $(websiteRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setSelectedWebsites(selectedValues);
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (websiteRef.current) {
                //$(websiteRef.current).select2('destroy');
            }
        };
    }, [websites]);
    useEffect(() => {
        // Initialize select2 for Select Team
        $(userRef.current).select2({
            placeholder: "Select User",
            allowClear: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setSelectedTags(selectedValues);
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (userRef.current) {
                //$(userRef.current).select2('destroy');
            }
        };

    }, [users]);



    useEffect(() => {
        // Calculate dynamic date range (last 1 month)
        const start = moment().subtract(1, 'month'); // 1 month ago
        const end = moment(); // Today

        setStartDate(start);
        setEndDate(end);

        // Initialize the date range picker with the dynamic date range
        $('#filterDate').daterangepicker(
            {
                locale: {
                    format: 'MM/DD/YYYY',
                },
                startDate: start,
                endDate: end,
            },
            function (start, end, label) {
                setFilterDate(start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY'));
                setStartDate(start);  // Update state with selected start date
                setEndDate(end);      // Update state with selected end date

            }
        );
    }, []);



    const fetchQueries = async () => {
        try {
            setLoading(true);

            const payload = {
                client_id: sessionStorage.getItem('id'),
                client_type: sessionStorage.getItem('user_type')
            };

            const response = await axios.post('https://99crm.phdconsulting.in/api/loadremainderquery', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch reports');
            }

            setReports(response.data.QueryRemainderData);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(error.message || 'Error fetching reports');
        } finally {
            setLoading(false);
        }
    };


    const fetchCategoryWebsites = async () => {
        try {
            setLoading(true);

            const category = sessionStorage.getItem('category');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            let whereStr = '';
            if (user_type != 'admin' && category) {
                whereStr = `${category}`; // Example: "team_id IN (1, 2, 3)"
            }

            const payload = { whereStr }


            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/phdwebsites', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch teams');
            }

            setWebsites(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Error fetching Teams');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const category = sessionStorage.getItem('category');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            let whereStr = '';
            if (user_type != 'admin' && category) {
                whereStr = `${category}`; // Example: "team_id IN (1, 2, 3)"
            }

            const payload = { whereStr }



            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/getallusers', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch users');
            }

            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Error fetching users');
        } finally {
            setLoading(false);
        }
    };







    useEffect(() => {
        fetchQueries();
        fetchCategoryWebsites();
        fetchUsers();
    }, []);




    const columns = [
        {
            title: 'Sel',
            data: 'id',
            width: '50px',
            orderable: false,
            render: (data) => {
                const isChecked = selectedQueries.includes(data);
                return `
                    <div style="width:30px;">
                        <input
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
            title: 'User Name',
            orderable: false,
            data: 'username',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Client Name',
            orderable: false,
            data: 'name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Email ID',
            orderable: false,
            data: 'email_id',
            render: (data, type, row) => {
                const bellIcon = row.showBellicon == 1 ? '<i class="fa fa-bell"></i>' : '';
                const dollarIcon = row.update_status == 3 ? '<i class="fa fa-dollar"></i>' : '';

                // Return the HTML with conditional icons
                return `
            <div style="text-align: left; cursor: pointer;" data-tooltip-id="my-tooltip" data-tooltip-content="${row.name}">
                ${data} ${bellIcon} ${dollarIcon}
            </div>
        `;
            },
        },
        {
            title: 'Website',
            orderable: false,
            data: 'website_name',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data ? data : 'Generic Query'}</div>`;
            },
        },
        {
            title: 'Shift Date',
            orderable: false,
            data: 'update_status_date',
            render: (data, type, row) => {
                if (!data) return '<div style="text-align: left;">-</div>';

                // Convert Unix timestamp to a readable date
                const date = new Date(data * 1000); // Multiply by 1000 if timestamp is in seconds
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                return `<div style="text-align: left;">${formattedDate}</div>`;
            },
        },

        {
            title: 'Reminder Date',
            orderable: false,
            data: 'remainder_date',
            render: (data, type, row) => {
                if (!data) return '<div style="text-align: left;">-</div>';

                // Convert Unix timestamp to a readable date
                const date = new Date(data * 1000); // Multiply by 1000 if timestamp is in seconds
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                return `<div style="text-align: left;">${formattedDate}</div>`;
            },
        },
        {
            title: 'Status',
            orderable: false,
            data: 'status_name',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data ? data : 'Generic Query'}</div>`;
            },
        },

    ];



    const handleCheckboxClick = (event) => {
        const id = parseInt(event.target.dataset.id, 10); // Parse the ID to ensure it's a number

        setSelectedQueries((prevSelectedQueries) => {
            if (event.target.checked) {
                // Add the ID to the state if checked
                return [...prevSelectedQueries, id];
            } else {
                // Remove the ID from the state if unchecked
                return prevSelectedQueries.filter((selectedId) => selectedId != id);
            }
        });

        // State updates are asynchronous, so this may not reflect the latest value immediately
    };

    // Refresh button handler
    const handleRefresh = () => {
        if (startDate && endDate) {
            fetchQueries(startDate, endDate, teamUsers); // Pass start and end dates to fetchReports
        } else {
            toast.error('Please select a date range first');
        }
    };



    const handleDelete = () => {
        if (selectedQueries.length === 0) {
            toast.error("Please select at least one query to delete.");
            return;
        }
        setIsModalOpen(true);
    };

    const onConfirmDelete = async () => {
        try {
            // Constructing the request body with the selected reports IDs
            const response = await fetch('https://99crm.phdconsulting.in/api/deletereminderqueryyy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedQueries }),
            });


            if (!response.ok) {
                throw new Error('Failed to delete Reports');
            }

            const data = await response.json();

            setReports(reports.filter((setting) => !selectedQueries.includes(setting.id)));
            toast.success('Query(s) deleted successfully!');
            setTimeout(() => {
                fetchQueries();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting queries.');
        } finally {

            setIsModalOpen(false);
            setSelectedQueries([]);


            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                filter_date: filterDate,
                website: selectedWebsites,
                user_id: selectedTags,
                search_type : searchType,
                search_keywords: searchKeywords,
                client_id: sessionStorage.getItem('id'),
                client_type: "admin"

            };

            const response = await fetch('https://99crm.phdconsulting.in/api/loadremainderquery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch reports, status: ${response.status}`);
            }

            const responseData = await response.json();
            setReports(responseData.QueryRemainderData);
        } catch (error) {
            console.error('Error fetching reports:', error);

        } finally {
            setLoading(false);
        }
    };
    const clearSelectedUsers = () => {
        setSelectedQueries([]);  // Clear selected users
      };

    const resetFilters = () => {
        setSearchKeywords('');
        setSelectedWebsites([]);
        setSelectedTags('');
        setSearchType('');
        setFilterDate('');
        setStartDate(null);
        setEndDate(null);
        $(websiteRef.current).val(null).trigger('change');
        $(userRef.current).val(null).trigger('change');
    };
    const handleAddQuery = () => {
        navigate('/addboxquery');
    }

    return (
        <div>
            <div className="my-3 flex justify-between flex-col mx-auto">
                <div className='flex w-full justify-between px-4'>
                    <h1 className="text-2xl font-bold">Remainder Query</h1>
                </div>
                <div
                    className="w-full flex X items-center gap-2 px-2 pt-2 qhpage"
                    id="filterDiv"
                >
                    {/* Date Range Picker */}
                    <input
                        id="filterDate"
                        type="text"
                        className="form-control py-2 w-2/3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="From Date - To Date"
                        value={filterDate}
                        readOnly
                    />

                    {/* Keyword Search */}
                    <input
                        type="text"
                        name="search_keywords"
                        id="search_keywords"
                        className="form-control w-2/3 py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter Keywords Name or Email or Phone"
                        value={searchKeywords}
                        onChange={(e) => setSearchKeywords(e.target.value)}
                    />

                    {/* Search Type Selection */}
                    <select
                        name="search_type"
                        id="search_type"
                        className="w-2/3 form-select py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="">Select Search Type</option>
                        <option value="query.query_code">Query Code</option>
                        <option value="query.name">Client Name</option>
                        <option value="query.email_id">Email ID</option>
                        <option value="query.phone">Phone</option>
                        <option value="query.location">Location</option>
                        <option value="query.city">City</option>
                        <option value="query.priority">Priority</option>
                        <option value="query.academic_level">Academic Level</option>
                    </select>

                    {/* Website Selection */}
                    <select
                        name="website"
                        id="website"
                        className="form-control w-2/3 py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        
                        value={selectedWebsites}
                        ref={websiteRef}
                    >
                        <option value="">Select Website</option>
                        {websites.map((website) => (
                            <option key={website.id} value={website.id}>
                                {website.website}
                            </option>
                        ))}
                    </select>

                    {/* Users Selection */}
                    <select
                        name="users"
                        id="users"
                        className=" w-1/2 select2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedTags}
                        ref={userRef}
                    >
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>

                    {/* Action Buttons */}
                    <div className="flex gap-1 buton ">
                        <button
                            onClick={handleSubmit}
                            className="bg-[#f39c12]  text-white rounded hover:bg-[#dd8c0a] flex items-center py-1 px-2"
                        >
                            <SearchIcon className="mr-2" size={14} />
                            Search
                        </button>
                        <button
                            onClick={resetFilters}
                            className="bg-red-500 text-white rounded hover:bg-red-400 flex items-center py-1 px-2"
                        >
                            Reset
                        </button>
                    </div>
                </div>

            </div>



            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-3 shadow-xl border-t-2 border-blue-400 rounded mx-auto'>
                    <div className='w-full flex items-center justify-end buton'>
                        {/* <button
                            onClick={handleDelete}
                            className="bg-[#f32112] text-white rounded hover:bg-red-800 flex items-center py-1 px-2 mr-2"
                        >
                            <Trash2 className='mr-2' size={14} />  Delete
                        </button> */}
                        
                        <ExportButtonQuery selectedQueries={selectedQueries} users={reports}  clearSelectedUsers={clearSelectedUsers}/>

                    </div>
                    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                        <DataTable
                            data={reports}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,

                                createdRow: (row, data) => {
                                    $(row).css('background-color', data.color_code || 'white');
                                    $(row).css('color', 'red');
                                    $(row).css('font-size', '12px !important');
                                    $(row).find('.checkbox').on('click', handleCheckboxClick);
                                },
                            }}
                        />
                    </div>
                </div>

            )}
            {isModalOpen && (
                <ConfirmationModal
                    context={{
                        title: 'Confirm Deletion',
                        message: `Are you sure you want to delete ${selectedQueries.length} query(s)?`,
                    }}
                    onConfirm={onConfirmDelete}
                    isReversible={false}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <ToastContainer />
            <AnimatePresence>

            </AnimatePresence>
            <Tooltip id="my-tooltip" />
        </div>
    );
};

export default RemainderQuery;
