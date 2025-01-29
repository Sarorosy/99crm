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
import QueryDetails from './QueryDetails';

const UserQuery = () => {
    DataTable.use(DT);

    const [tags, setTags] = useState([]);
    const [teamUsers, setTeamUsers] = useState([])
    const [reports, setReports] = useState([]);
    const [teams, setTeams] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [status, setStatus] = useState([]);
    const [users, setUsers] = useState([]);
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [selectedQueries, setSelectedQueries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [startDate, setStartDate] = useState(null); // Store start date
    const [endDate, setEndDate] = useState(null); // Store end date
    const [searchTeamId, setSearchTeamId] = useState([]);
    const [searchKeywords, setSearchKeywords] = useState("");
    const [refId, setRefId] = useState("");
    const [selectedWebsites, setSelectedWebsites] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [updateStatus, setUpdateStatus] = useState("");
    const [iconFilter, setIconFilter] = useState("");
    const [transferType, setTransferType] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedState, setSelectedState] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('')
    const [callWhatsapp, setSelectedCallWhatsapp] = useState('');
    const [callOptions, setCallOptions] = useState([]);
    const [whatsappOptions, setWhatsappOptions] = useState([]);
    const userType = sessionStorage.getItem('user_type');
    const [selectedRefId, setSelectedRefId] = useState('');
    const [detailsOpen, setDetailsOpen] = useState(false);



    const websiteRef = useRef(null);
    const tagsRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        // Initialize select2 for Select Team
        $(websiteRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
            multiple: true,
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
        $(tagsRef.current).select2({
            placeholder: "Select Tags",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setSelectedTags(selectedValues);
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (tagsRef.current) {
                //$(tagsRef.current).select2('destroy');
            }
        };
    }, [tags]);


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

    const fetchTeamUsers = async (selectedTeamId, load, loading) => {
        try {
            if (loading && loading == '') {
                setLoading(true);
            }
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage
            const team_id = (selectedTeamId && selectedTeamId != '') ? selectedTeamId : sessionStorage.getItem('team_id');



            const payload = {
                team_ids: team_id,  // Send as a string or convert to an array if required
                user_type: user_type,
            };


            const response = await fetch(
                'https://99crm.phdconsulting.in/99crmwebapi/api/getallusersforpricequoteid',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload), // Convert payload to JSON string
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch users, status: ${response.status}`);
            }

            // Parse response JSON
            const responseData = await response.json();




            setTeamUsers(responseData.data);  // Set the teamUsers state

            if (load && load != "") {
                // After setting teamUsers, call fetchQueries
                fetchQueries(teamUsers);
            }

        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(error.message || 'Error fetching reports');
        }
    };

    const fetchQueries = async (teamUsers) => {
        try {
            setLoading(true);

            const payload = {
                team_id: teamUsers
            };

            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/loaduserquery', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch reports');
            }

            setReports(response.data.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(error.message || 'Error fetching reports');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            setLoading(true);

            const team_id = sessionStorage.getItem('team_id');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            let whereStr = '';
            if (user_type != 'admin' && team_id) {
                whereStr = `team_id IN (${team_id})`; // Example: "team_id IN (1, 2, 3)"
            }

            const payload = {
                whereStr,
            };


            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/teams', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch teams');
            }

            setTeams(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Error fetching Teams');
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

    const fetchTags = async () => {
        try {
            setLoading(true);

            const category = sessionStorage.getItem('category');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            let whereStr = '';
            if (user_type != 'admin' && category) {
                whereStr = `${category}`; // Example: "team_id IN (1, 2, 3)"
            }

            const payload = { whereStr }



            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/tags', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch tags');
            }

            setTags(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Error fetching tags');
        } finally {
            setLoading(false);
        }
    };
    const fetchStatus = async () => {
        try {
            setLoading(true);



            const whereStr = 'id != 4';

            const payload = { whereStr };

            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/status', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch tags');
            }

            setStatus(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Error fetching tags');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const team_ids = sessionStorage.getItem('team_id');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage



            const payload = {
                team_ids: team_ids,  // Send as a string or convert to an array if required
                user_type: user_type,
            };


            const response = await fetch(
                'https://99crm.phdconsulting.in/99crmwebapi/api/getallusersforpricequote',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload), // Convert payload to JSON string
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch users, status: ${response.status}`);
            }

            // Parse response JSON
            const responseData = await response.json();

            setUsers(responseData.data);

        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(error.message || 'Error fetching Users');
        } finally {
            setLoading(false);
        }
    };
    const fetchStates = async () => {
        try {
            setLoading(true);




            const response = await axios.get('https://99crm.phdconsulting.in/99crmwebapi/api/states', {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch states');
            }

            setStates(response.data.data);
        } catch (error) {
            console.error('Error fetching states:', error);
            toast.error(error.message || 'Error fetching States');
        } finally {
            setLoading(false);
        }
    };
    const fetchCallOptions = async () => {
        try {
            setLoading(true);




            const response = await axios.get('https://99crm.phdconsulting.in/99crmwebapi/api/callopt', {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch options');
            }

            setCallOptions(response.data.data);
        } catch (error) {
            console.error('Error fetching states:', error);
            toast.error(error.message || 'Error fetching options');
        } finally {
            setLoading(false);
        }
    };
    const fetchWhatsappOptions = async () => {
        try {
            setLoading(true);




            const response = await axios.get('https://99crm.phdconsulting.in/99crmwebapi/api/whatsappopt', {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch option');
            }

            setWhatsappOptions(response.data.data);
        } catch (error) {
            console.error('Error fetching states:', error);
            toast.error(error.message || 'Error fetching options');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchTeamIdChange = (e) => {
        const selectedTeamId = e.target.value;
        setSearchTeamId(selectedTeamId);

        // Trigger fetchTeamUsers on team selection
        if (selectedTeamId) {
            fetchTeamUsers(selectedTeamId, '', 'noloading');
        }
    };


    useEffect(() => {
        fetchQueries();
        fetchTeamUsers('', '', '');
        fetchTeams();
        fetchCategoryWebsites();
        fetchTags();
        fetchStatus();
        fetchUsers();
        fetchStates();
        fetchCallOptions();
        fetchWhatsappOptions();
    }, []);

    useEffect(() => {
        // Fetch states when the component mounts
        axios.get("https://99crm.phdconsulting.in/99crmwebapi/api/states")
            .then(response => {
                setStates(response.data.data);
            })
            .catch(error => {
                console.error("There was an error fetching the states!", error);
            });
    }, []);

    const handleStateChange = (e) => {
        const selectedStateId = e.target.value;
        setSelectedState(selectedStateId);

        // Fetch cities based on the selected state
        if (selectedStateId) {
            axios.post(`https://99crm.phdconsulting.in/99crmwebapi/api/cities/${selectedStateId}`)
                .then(response => {
                    setCities(response.data.data);
                })
                .catch(error => {
                    console.error("There was an error fetching the cities!", error);
                });
        } else {
            setCities([]); // Clear cities if no state is selected
        }
    };

    const columns = [
        {
            title: 'Ref No.',
            orderable: false,
            data: 'assign_id',
            render: (data, type, row) => {
                return `
                    <div style="text-align: left; display: flex; align-items: center; gap: 10px;">
                        <span class="view-btn bg-blue-500 hover:bg-blue-600" style="padding: 2px 3px; border: none; color: white; border-radius: 4px; cursor: pointer;">${data}</span>
                       
                    </div>
                `;
            },
        },
        {
            title: 'Username',
            orderable: false,
            data: 'user_name',
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
            title: 'Client Name',
            orderable: false,
            data: 'name',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Website',
            orderable: false,
            data: 'website_name',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Contact No',
            orderable: false,
            data: 'phone',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'City',
            orderable: false,
            data: 'city',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Tags',
            orderable: false,
            data: 'tag_names',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Ownership',
            orderable: false,
            data: 'transfer_type',
            render: (data, type, row) => {
                let ownershipText = '';

                if (data == 1) {
                    ownershipText = 'Transferred';
                } else if (data == 2) {
                    ownershipText = `Replicated from ${row.trans_repli_user}`;
                } else {
                    ownershipText = 'Fresh';
                }

                return `<div style="text-align: left;">${ownershipText}</div>`;
            },
        },
        {
            title: 'Status',
            orderable: false,
            data: 'status_name',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Assign Date',
            orderable: false,
            data: 'assign_date',
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

    ];



    const handleCheckboxClick = (event) => {
        const id = $(event.target).data('id');
        setSelectedQueries((prev) =>
            $(event.target).is(':checked') ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
        );
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
            toast.error("Please select at least one setting to delete.");
            return;
        }
        setIsModalOpen(true);
    };

    const onConfirmDelete = async () => {
        try {
            // Constructing the request body with the selected reports IDs
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/deleteboxtag', {
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
            toast.success('Reports deleted successfully!');
            setTimeout(() => {
                fetchQueries();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting Reports.');
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
                team_id: teamUsers,
                filter_date: filterDate,
                ref_id: refId,
                website: selectedWebsites,
                tags: selectedTags,
                state: selectedState,
                city: selectedCity,
                icon_filter: iconFilter,
                update_status: updateStatus,
                search_keywords: searchKeywords,
                transfer_type: transferType,
            };

            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/loaduserquery', {
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
            setReports(responseData.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(error.message || 'Error fetching reports');
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSearchTeamId([]);
        setSearchKeywords('');
        setRefId('');
        setSelectedWebsites([]);
        setSelectedTags([]);
        setUpdateStatus('');
        setIconFilter('');
        setTransferType('');
        setSelectedUser('');
        setSelectedCallWhatsapp('');
        setSelectedState('');
        setSelectedQueries([]);
        setFilterDate('');
        setStartDate(null);
        setEndDate(null);
        $(websiteRef.current).val(null).trigger('change');
        $(tagsRef.current).val(null).trigger('change');
    };
    const handleAddQuery = () => {
        navigate('/addquery');
    }

    const handleViewButtonClick = (data) => {
        setSelectedRefId(data.assign_id);
        setDetailsOpen(true);
    }

    return (
        <div>
            <div className="my-3 flex justify-between flex-col mx-auto qhpage">
                <div className='flex w-full justify-between px-4'>
                    <h1 className="text-2xl font-bold">Query History</h1>
                    <div className='mdbut'>
                        <button
                            onClick={handleRefresh}
                            className="bg-gray-200 text-gray-500 py-1 px-2 rounded hover:bg-gray-300"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>
                </div>
                <div className="w-full flex flex-wrap gap-2 px-4 pt-2 qhpage" id="filterDiv">
                    {/* Team Selection */}
                    {userType != "user" && userType != "Operations Manager" && (
                        <select
                            name="search_team_id"
                            id="search_team_id"
                            className="form-select select2 w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onChange={handleSearchTeamIdChange}
                            value={searchTeamId}
                        >
                            <option value="">Select Team</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.team_name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Date Range Picker */}
                    <input
                        id="filterDate"
                        type="text"
                        className="form-control w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="From Date - To Date"
                        value={filterDate}
                        readOnly
                    />

                    {/* Keyword Search */}
                    <input
                        type="text"
                        name="search_keywords"
                        id="search_keywords"
                        className="form-control w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter Keywords Name or Email or Phone"
                        value={searchKeywords}
                        onChange={(e) => setSearchKeywords(e.target.value)}
                    />

                    {/* Reference ID */}
                    <input
                        type="text"
                        name="ref_id"
                        className="form-control w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter Ref. Id"
                        value={refId}
                        onChange={(e) => setRefId(e.target.value)}
                    />


                    {/* Status Selection */}
                    <select
                        name="update_status"
                        id="update_status"
                        className="form-select w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                    >
                        <option value="">Select Status</option>
                        {status
                            .filter((statusItem) => statusItem.id !== 4)
                            .map((statusItem) => (
                                <option key={statusItem.id} value={statusItem.id}>
                                    {statusItem.status_name}
                                </option>
                            ))}
                    </select>

                    {/* Icon Filter */}
                    <select
                        name="icon_filter"
                        id="icon_filter"
                        className="form-select w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={iconFilter}
                        onChange={(e) => setIconFilter(e.target.value)}
                    >
                        <option value="">Select Icon</option>
                        <option value="Bell">Bell</option>
                        <option value="Dollar">Dollar</option>
                        <option value="Calendar">Calendar</option>
                    </select>

                    {/* Transfer Type */}
                    {userType !== "user" && (
                        <select
                            name="transfer_type"
                            id="transfer_type"
                            className="form-select w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={transferType}
                            onChange={(e) => setTransferType(e.target.value)}
                        >
                            <option value="">Select All</option>
                            <option key="Fresh" value="Fresh">Fresh</option>
                            <option key='1' value="Transferred">Transferred</option>
                            <option key='2' value="Replicated">Replicated</option>
                            <option key='Bell' value="Bell">Show Bell Icon</option>
                        </select>
                    )}

                    {/* User Selection */}
                    <select
                        name="user_id"
                        id="user_id"
                        className="form-select select2 w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">
                            {userType !== "user" ? "Select User" : "Absent User"}
                        </option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>

                    {/* Call / Whatsapp */}
                    <select
                        name="callWhatsapp"
                        id="callWhatsapp"
                        className="form-select select2 w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={callWhatsapp}
                        onChange={(e) => setSelectedCallWhatsapp(e.target.value)}
                    >
                        <option value="">Select Call / Whatsapp</option>
                        <option value="Call">Call </option>
                        <option value="Whatsapp">Whatsapp</option>
                    </select>

                    {/* Call/Whatsapp Options */}
                    {callWhatsapp && callWhatsapp === "Call" && (
                        <select
                            className="form-select w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onChange={(e) => setUpdateStatus(e.target.value)}
                            value={updateStatus}
                        >
                            <option value="">Select Call Option</option>
                            {callOptions.map((option) => {
                                let callFromStatus = '';
                                let callToStatus = '';
                                if (option.status_from == 1) callFromStatus = 'Lead In';
                                if (option.status_from == 2) callFromStatus = 'Contact Made';
                                if (option.status_from == 3) callFromStatus = 'Quoted';
                                if (option.status_from == 6) callFromStatus = 'Client Not Interested';
                                if (option.status_from == 7) callFromStatus = 'Reminder';

                                if (option.status_to == 2) callToStatus = 'Contact Made';
                                if (option.status_to == 6) callToStatus = 'Client Not Interested';
                                if (option.status_to == 3) callToStatus = 'Quoted';

                                return (
                                    <option key={option.id} value={option.id}>
                                        {callFromStatus} - {callToStatus} | {option.option_val}
                                    </option>
                                );
                            })}
                        </select>
                    )}

                    {callWhatsapp && callWhatsapp === "Whatsapp" && (
                        <select
                            className="form-select w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onChange={(e) => setSelectedTags(e.target.value)}
                            value={selectedTags}
                        >
                            <option value="">Select WhatsApp Option</option>
                            {whatsappOptions.map((option) => {
                                let whatsappFromStatus = '';
                                let whatsappToStatus = '';
                                if (option.status_from == 1) whatsappFromStatus = 'Lead In';
                                if (option.status_from == 2) whatsappFromStatus = 'Contact Made';
                                if (option.status_from == 3) whatsappFromStatus = 'Quoted';
                                if (option.status_from == 6) whatsappFromStatus = 'Client Not Interested';
                                if (option.status_from == 7) whatsappFromStatus = 'Reminder';

                                if (option.status_to == 2) whatsappToStatus = 'Contact Made';
                                if (option.status_to == 6) whatsappToStatus = 'Client Not Interested';
                                if (option.status_to == 3) whatsappToStatus = 'Quoted';

                                return (
                                    <option key={option.id} value={option.id}>
                                        {whatsappFromStatus} - {whatsappToStatus} | {option.option_val}
                                    </option>
                                );
                            })}
                        </select>
                    )}
                    <select
                        name="state"
                        id="state"
                        className=" form-select select2 w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedState}
                        onChange={handleStateChange}
                    >
                        <option value="">Select State</option>
                        {states.map((state) => (
                            <option key={state.id} value={state.id}>
                                {state.name}
                            </option>
                        ))}
                    </select>

                    {selectedState && (
                        <select
                            name="city"
                            id="city"
                            className="form-select select2 w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select City</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    )}

                </div>
            </div>

            <div class="col-md-12 px-4 py-0">
                <div className='row'>
                    <div className='col-md-6'>
                        {/* Website Selection */}
                        <select
                            name="website"
                            id="website"
                            className="form-select select2 w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            multiple
                            value={selectedWebsites}
                            // onChange={(e) =>
                            //     setSelectedWebsites(Array.from(e.target.selectedOptions, (option) => option.value))
                            // }
                            ref={websiteRef}
                        >
                            <option value="">Select Website</option>
                            {websites.map((website) => (
                                <option key={website.id} value={website.id}>
                                    {website.website}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='col-md-6'>
                        {/* Tags Selection */}
                        <select
                            name="tags"
                            id="tags"
                            className="form-select select2 w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            multiple
                            value={selectedTags}
                            // onChange={(e) =>
                            //     setSelectedTags(Array.from(e.target.selectedOptions, (option) => option.value))
                            // }
                            ref={tagsRef}
                        >
                            <option value="">Select Tags</option>
                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>
                                    {tag.tag_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='last mb-4 mt-2'>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white py-1 px-2 rounded flex items-center mr-3"
                    >
                        <SearchIcon className="mr-2" size={12} />
                        Search
                    </button>
                    <button
                        onClick={resetFilters}
                        className="btn btn-success text-white py-1 px-2 rounded flex items-center"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-3 shadow-xl border-t-2 border-blue-400 rounded mx-auto'>
                    <div className='w-full flex items-center justify-end buton mb-3'>
                        <button
                            onClick={handleAddQuery}
                            className="bg-[#f39c12] text-white rounded hover:bg-orange-400 flex items-center py-1 px-2"
                        >
                            <Plus className='mr-2' size={14} />  Add query
                        </button>
                    </div>
                    <div>
                        <DataTable
                            data={reports}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,
                                createdRow: (row, data) => {
                                    $(row).css('background-color', data.color_code || 'white');
                                    $(row).css('font-size', '12px !important');
                                    $(row).find('.checkbox').on('click', handleCheckboxClick);
                                    $(row).find('.view-btn').on('click', () => {
                                        handleViewButtonClick(data);
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
                        title: 'Confirm Deletion',
                        message: `Are you sure you want to delete ${selectedQueries.length} setting(s)?`,
                    }}
                    onConfirm={onConfirmDelete}
                    isReversible={false}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <ToastContainer />
            <AnimatePresence>
                {detailsOpen && (
                    <QueryDetails refId={selectedRefId} onClose={() => setDetailsOpen(!detailsOpen)} />
                )}
            </AnimatePresence>
            <Tooltip id="my-tooltip" />
        </div>
    );
};

export default UserQuery;
