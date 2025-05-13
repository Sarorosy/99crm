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
import { RefreshCcw, FilterIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import QueryDetails from '../../managequery/QueryDetails';


const ManageDailyWorkStatus = () => {
    const [quotes, setQuotes] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [refId, setRefId] = useState('');
    const [dateFilter, setDateFilter] = useState('today');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('')
    const [loading, setLoading] = useState(false);
    const selectTeamRef = useRef(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showModal, setShowModal] = useState(false);

    DataTable.use(DT);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectTeamRef.current).select2({
            placeholder: "Select User",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedUser($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectTeamRef.current) {
                // $(selectTeamRef.current).select2('destroy');
            }
        };
    }, [users]);

    // Fetch all data on initial render
    useEffect(() => {
        fetchFilteredQuotes();

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



    const fetchFilteredQuotes = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/getalldailyworkstatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date_filter: dateFilter,
                    user_id: selectedUser,
                    status: status,
                    team_id : sessionStorage.getItem('team_id'),
                    user_type: sessionStorage.getItem('user_type')
                }),
            });

            const data = await response.json(); // Parse the response as JSON

            if (data.status) {
                setQuotes(data.userArr); // Update quotes state
                setUsers(data.userData);
            }
        } catch (error) {
            console.error('Error fetching filtered quotes:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleViewButtonClick = (data) => {
        setSelectedQuote(data);
        setShowModal(true);
    };
    $(document).on('click', '.copy-btn', function () {
        const refId = $(this).data('ref');
        navigator.clipboard.writeText(refId).then(() => {
            // Optional: give feedback to the user
            $(this).text('✅');
            setTimeout(() => {
                $(this).text('📋');
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy!', err);
        });
    });

    const [selectedRefId, setSelectedRefId] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleViewQueryButtonClick = (data) => {
        setSelectedRefId(data.ref_id);
        setDetailsOpen(true);
    }


    const columns = [

        
        {
            title: 'Name ',
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
            title: 'Work Status',
            data: 'selected_work_status',
            orderable: false,
            render: (data) => {
                let label = '';
                if (data == 1) {
                    label = 'Need Max Fresh Enquiries';
                } else if (data == 2) {
                    label = 'Need Few Fresh Enquiries';
                } else if (data == 3) {
                    label = 'No Leads Required';
                }
                return `<div style="text-align: left;">${label}</div>`;
            },
        },
        {
            title: 'Submitted Date',
            data: 'selected_at',
            orderable: false,
            render: (data) => {
                if (!data) return '';
        
                const date = new Date(data);
                return date.toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
            },
        },
        {
            title: 'Assigned Lead Count',
            data: 'lead_count',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data}</div>`,
        },
        
        


    ];

    const resetFilters = () => {
        setDateFilter('today');
        setRefId('');
        setSelectedUser('');

        $(selectTeamRef.current).val(null).trigger('change');
        setStatus('');
        fetchFilteredQuotes();  // Fetch unfiltered data
    };

    return (
        <div className="container bg-gray-100 w-full add">
            <h1 className='text-xl font-bold'>Daily Work Status</h1>

            {/* Filter Section */}
            <div className="flex items-center space-x-2 my-4 bg-white p-2 rounded">
                
                <div className="w-1/2">
                    <select
                        id="user_id"
                        className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control"

                        value={selectedUser}
                        ref={selectTeamRef}
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-1/2">

                    <select
                        className="form-control"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="1">Need Max Fresh Enquiries</option>
                        <option value="2">Need Few Fresh Enquiries</option>
                        <option value="3">No Leads Required</option>
                    </select>
                </div>

                <div className="w-1/2">

                    <select
                        className="form-control"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="last_3_days">Last 3 Days</option>
                        <option value="last_7_days">Last 7 Days</option>
                    </select>
                </div>
                <div className="w-1/2 flex items-center space-x-2 last">
                    <label>&nbsp;</label>
                    <button className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2 flex items-center" onClick={fetchFilteredQuotes}>
                        Apply Filters
                        &nbsp;
                        <FilterIcon size={12} className="" />
                    </button>
                    <button className="bg-gray-200 text-gray-500 py-1 px-2 rounded hover:bg-gray-300" onClick={resetFilters}>
                        <RefreshCcw size={15} />
                    </button>

                </div>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-2 border-t-2 border-blue-400 rounded'>
                    <DataTable
                        data={quotes}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            createdRow: (row, data) => {
                                $(row).find('.view-btn').on('click', () => {
                                    handleViewButtonClick(data);
                                });

                                $(row).find('.view-query-btn').on('click', () => {
                                    handleViewQueryButtonClick(data);
                                });
                            },
                        }}
                    />
                </div>
            )}

            <AnimatePresence>
                {detailsOpen && (
                    <QueryDetails refId={selectedRefId} onClose={() => setDetailsOpen(!detailsOpen)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageDailyWorkStatus;
