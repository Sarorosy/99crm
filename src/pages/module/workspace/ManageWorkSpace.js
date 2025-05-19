import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';
import 'select2/dist/css/select2.css';
import 'select2';
import CustomLoader from '../../../components/CustomLoader';
import { RefreshCcw, FilterIcon, X, Trash2, ArrowRight, ChevronDown, ChevronRight, PlusIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import WorkSpaceQueryDetails from './WorkSpaceQueryDetails';
import AddWorkSpaceQuery from './AddWorkSpaceQuery';
import { getSocket } from '../../../Socket';

const ManageWorkSpace = () => {
    const socket = getSocket();
    const [quotes, setQuotes] = useState([]);
    const [totalQuotes, setTotalQuotes] = useState([]);
    const [approvedQuotes, setApprovedQuotes] = useState([]);
    const [onHoldQuotes, setOnHoldQuotes] = useState([]);
    const [rejectedQuotes, setRejectedQuotes] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [keywords, setKeywords] = useState('');
    const [assignType, setAssignType] = useState('');
    const [websites, setWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState('')
    const [loading, setLoading] = useState(false);
    const selectTeamRef = useRef(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedQueries, setSelectedQueries] = useState([]);

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isAddQueryModalOpen, setIsAddQueryModalOpen] = useState(false);

    DataTable.use(DT);


    useEffect(() => {
        // Fetch managers data from the API
        fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/websites')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setWebsites(data.data); // Assuming data.data contains the managers
                } else {
                    console.error('Failed to fetch websites');
                }
            })
            .catch(err => console.error('Error fetching websites:', err));

    }, []);
    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectTeamRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {

            setSelectedWebsite($(e.target).val());

        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectTeamRef.current) {
                // $(selectTeamRef.current).select2('destroy');
            }
        };
    }, [websites]);

    // Fetch all data on initial render
    useEffect(() => {
        fetchQuotes();

        // Initialize the date range picker on component mount
        $('#filterDate').daterangepicker(
            {
                locale: {
                    format: 'MM/DD/YYYY',
                },
                startDate: moment().startOf('month'),
                endDate: moment().endOf('month'),
            },
            function (start, end, label) {
                setFilterDate(start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY'));
            }
        );

    }, []);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'https://99crm.phdconsulting.in/zend/api/load-workspace-data', {
                user_id: sessionStorage.getItem('id'),
                user_type: sessionStorage.getItem('user_type'),
                assignType: assignType,
                search_keywords: keywords,
                filter_date: filterDate,
                website: selectedWebsite,
            }
            );
            if (response.data.status) {
                setQuotes(response.data.queryData ?? []);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuotesForSocket = async () => {
        try {
            const response = await axios.post(
                'https://99crm.phdconsulting.in/zend/api/load-workspace-data', {
                user_id: sessionStorage.getItem('id'),
                user_type: sessionStorage.getItem('user_type'),
                assignType: assignType,
                search_keywords: keywords,
                filter_date: filterDate,
                website: selectedWebsite,
            }
            );
            if (response.data.status) {
                setQuotes(response.data.queryData ?? []);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const clickSocket = () => {
        socket.emit('new_query', { message: 'New query added' });
    }

    const handleViewClick = (quote) => {
        setSelectedQuote(quote);
        setShowModal(true);
    };

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

    const columns = [
        {
            title: 'Sel',
            data: 'id',
            width: '50px',
            orderable: false,
            render: (data, type, row) => {
                // Only show checkbox if validation_status is empty
                if (!row.validation_status) {
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
                }
                return ''; // Return empty string if validation_status exists
            },
        },
        {
            title: 'Name',
            data: 'name',
            orderable: true,
            width: '90px !important',
            render: (data, type, row) => `
            <div style="text-align: left;font-size: 12px; width: 90px !important;">
            ${data}
            ${row.already_exist == "Yes" ? `<span class="text-red-500">Already Exist</span>` : ''}
            </div>`,
        },
        {
            title: 'Email Id',
            data: 'email_id',
            orderable: false,
            width: '80px !important',
            render: (data, type, row) => `<div style="text-align: left;font-size: 12px; width: 180px !important;">${data}
            ${(row.duplicate != null) ? `<span class="text-red-700 bg-red-100 p-1 rounded">Duplicate</span>` : ''}
            </div>`,
        },
        {
            title: 'Assigned',
            data: 'username',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data ?? ""}</div>`,
        },
        {
            title: 'Assign Type',
            data: 'assignType',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data || ''}</div>`,
        },
        {
            title: 'Website',
            data: null,
            orderable: false,
            render: (data, type, row) => `<div style="text-align: left;">${row.website == "others" ? row.other_website : (row.website ?? "")}</div>`,
        },
        {
            title: 'Requirement',
            data: null,
            orderable: false,
            render: (data, type, row) => `<div style="text-align: left; width: 200px !important;">${row.line_format} ${row.paragraph_format}</div>`,
        },
        {
            title: 'Created Date',
            data: 'created_on',
            orderable: false,
            render: (data) => {
                return data ? new Date(data * 1000).toLocaleDateString() : 'N/A';
            },
        },
        {
            title: 'Action',
            data: null,
            orderable: false,
            render: (data) => `<div style="text-align: left;width: 90px !important;">
            <button class="view-btn bg-blue-500 text-white px-2 py-1 rounded-md shadow-sm hover:bg-blue-600 transition-colors">
                View
            </button>
            </div>`,
        },
    ];

    const resetFilters = () => {
        setFilterDate('');
        setKeywords('');
        setSelectedWebsite('');

        $(selectTeamRef.current).val(null).trigger('change');
        setAssignType('');
        fetchQuotes();  // Fetch unfiltered data
    };

    const handleDelete = async () => {
        if (selectedQueries.length == 0) {
            toast.error("Please select at least one query");
            setIsModalOpen(false)
            return;
        }

        try {
            const response = await axios.post(
                'https://99crm.phdconsulting.in/zend/api/deleteworkspacequery',
                {
                    checkid: selectedQueries
                }
            );

            if (response.data.status) {
                toast.success(response.data.message || 'Workspace query(s) is deleted successfully.');
                fetchQuotes(); // Refresh the data
                setSelectedQueries([]); // Clear selections
            } else {
                toast.error(response.data.message || 'Failed to delete queries');
            }
        } catch (error) {
            console.error('Error deleting queries:', error);
            toast.error('Failed to delete queries');
        } finally {
            setIsModalOpen(false)
        }
    }
    /////////////////////////////////////////////
    useEffect(() => {
        socket.on('new_query_emit', (data) => {
            console.log("Socket data received:", data);
            if (sessionStorage.getItem('user_type') == "admin" || sessionStorage.getItem('user_type') == "Data Manager" || sessionStorage.getItem('user_type') == "sub-admin") {
                fetchQuotesForSocket();
            } else if (sessionStorage.getItem('user_type') == "user" && data.user_id == sessionStorage.getItem('id')) {
                fetchQuotesForSocket();
            }
        });

        return () => {
            socket.off('new_query');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('new_hold_query_emit', (data) => {
            console.log("Socket data received:", data);
            fetchQuotesForSocket();
        });

        return () => {
            socket.off('new_hold_query_emit');  // Clean up on component unmount
        };
    }, []);
    /////////////////////////////////////////////

    return (
        <div className="bg-white w-full add">
            <div className='py-2'>
                <h1 className='text-md font-bold ml-1 ' >WorkSpace</h1>
            </div>

            {/* Filter Section */}
            <div className="flex items-center space-x-2 my-2 bg-gray-50 p-2 rounded">
                <div className="w-1/2">
                    <input
                        id="filterDate"
                        type="text"
                        className="form-control"
                        placeholder="From Date - To Date"
                        value={filterDate}
                        readOnly
                    />
                </div>
                <div className="w-1/2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder='Enter Keywords Name or Email or Phone'
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                    />
                </div>
                <div className="w-1/2" style={{ display: sessionStorage.getItem('user_type') != "user" ? "block" : "none" }}>
                    <select
                        id="website_filter"
                        className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control"

                        value={selectedWebsite}
                        ref={selectTeamRef}
                    >
                        <option value="">Select Website</option>
                        {websites.map(website => (
                            <option key={website.id} value={website.id}>
                                {website.website}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-1/2" style={{ display: sessionStorage.getItem('user_type') != "user" ? "block" : "none" }}>

                    <select
                        className="form-control"
                        value={assignType}
                        onChange={(e) => setAssignType(e.target.value)}
                    >
                        <option value="">Select Assign Type</option>
                        <option value="crmuser">CRM User</option>
                        <option value="sub-admin">SubAdmin</option>
                    </select>
                </div>
                <div className="w-1/2 flex items-center space-x-2 last">
                    <label>&nbsp;</label>
                    <button className="bg-blue-400 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2 flex items-center" onClick={fetchQuotes}>
                        Apply Filters &nbsp;
                        <FilterIcon size={12} className="" />
                    </button>
                    <button className="text-gray-500 py-1 px-1 rounded hover:bg-gray-300" onClick={resetFilters}>
                        <RefreshCcw size={15} />
                    </button>

                </div>
            </div>


            {loading ? (
                <CustomLoader />
            ) : (
                <>

                    {(sessionStorage.getItem('user_type') == "admin" || sessionStorage.getItem('user_type') == "Data Manager") && (

                        <div className='bg-white flex items-center justify-end my-2 p-2 rounded'>
                            <button onClick={() => setIsAddQueryModalOpen(true)} className="btn btn-warning btn-sm mr-2 flex items-center" style={{ fontSize: "12px !important" }}>
                                Add Query <PlusIcon size={13} className='ms-1' />
                            </button>
                            {sessionStorage.getItem('user_type') == "admin" && (
                                <button onClick={() => setIsModalOpen(true)} className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-2 flex items-center">
                                    <Trash2 className="" size={12} />
                                </button>
                            )}
                        </div>
                    )}
                    <div className='bg-white p-2 border-t-2 border-green-400 rounded'>
                        <DataTable
                            data={quotes}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                createdRow: (row, data) => {
                                    $(row).find('.view-btn').click(function () {
                                        handleViewClick(data);
                                    });
                                    $(row).find('.checkbox').on('click', handleCheckboxClick);
                                },
                            }}
                        />
                    </div>
                </>
            )}

            <AnimatePresence>
                {showModal && (
                    <WorkSpaceQueryDetails queryId={selectedQuote.id} onClose={() => setShowModal(false)} finalFunction={fetchQuotes} />

                )}
                {isModalOpen && (
                    <ConfirmationModal
                        context={{
                            title: 'Confirm Deletion',
                            message: 'Are you sure you want to delete the selected queries?',
                        }}
                        onConfirm={handleDelete}
                        isReversible={false}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
                {isAddQueryModalOpen && (
                    <AddWorkSpaceQuery onClose={() => setIsAddQueryModalOpen(false)} finalFunction={fetchQuotes} />
                )}

            </AnimatePresence>

        </div>
    );
};

export default ManageWorkSpace;
