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
import MilestonePaymentDetails from './MilestonePaymentDetails';
import { AnimatePresence } from 'framer-motion';


const MilestonePayments = () => {
    const [quotes, setQuotes] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [refId, setRefId] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('')
    const [loading, setLoading] = useState(false);
    const selectTeamRef = useRef(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showModal, setShowModal] = useState(false);

    DataTable.use(DT);


    useEffect(() => {
        // Fetch managers data from the API
        fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/getallusers')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setUsers(data.data); // Assuming data.data contains the managers
                } else {
                    console.error('Failed to fetch users');
                }
            })
            .catch(err => console.error('Error fetching users:', err));

    }, []);
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
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/loadpaymentmilestones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filter_date: filterDate,
                    ref_id: refId,
                    user_id: selectedUser,
                    status: status,
                }),
            });

            const data = await response.json(); // Parse the response as JSON

            if (data.status) {
                setQuotes(data.quoteData); // Update quotes state
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

    const columns = [
        {
            title: 'Sr. No.',
            data: null,
            orderable: false,
            width: '50px',
            render: (data, type, row, meta) => {
                return `<div style="text-align: left;">${meta.row + 1}</div>`;
            },
        },
        {
            title: 'Ref Id',
            data: 'ref_id',
            orderable: true,
            render: (data, type, row, meta) => {
                return `<div class="view-btn" style="text-align: center;background-color:#172554;color:white; padding:1px;border-radius:5px;cursor:pointer;" >${data}</div>`;
            },
        },
        {
            title: 'Company ',
            data: 'display_name',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data}</div>`,
        },
        {
            title: 'CRM Name',
            data: 'crm_name',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data}</div>`,
        },
        {
            title: 'Service Name',
            data: 'service_name',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data}</div>`,
        },
        {
            title: 'Milestone Price',
            data: 'milestone_price',
            orderable: false,
            render: (data, type, row) => `<div style="text-align: left;">${row.currency_type || ''} ${data || 'N/A'}</div>`,
        },
        {
            title: 'Planner Status',
            data: 'PhdPlanerPayment',
            orderable: false,
            width: '80px',
            render: (data) => `<div style="text-align: left;">${data ? 'Yes' : 'No'}</div>`,
        },
        {
            title: 'Paid Date',
            data: 'paid_date',
            orderable: false,
            render: (data) => {
                return data ? new Date(data * 1000).toLocaleDateString() : 'N/A';
            },
        },
        {
            title: 'Status',
            data: 'status',
            orderable: false,
            render: (data) => {
                let statusLabel = '';
                switch (data) {
                    case 1:
                    case '1':
                        statusLabel = '<span class="label label-warning">Paid</span>';
                        break;
                    case 2:
                    case '2':
                        statusLabel = '<span class="label label-success">Confirmed</span>';
                        break;
                    case 3:
                    case '3':
                        statusLabel = '<span class="label label-danger">Rejected</span>';
                        break;
                    default:
                        statusLabel = `<span class="label">${data || ''}</span>`;
                }
                return `<div style="text-align: left;">${statusLabel}</div>`;
            },
        },
        {
            title: 'Milestone Name',
            data: 'milestone_name',
            orderable: false,
            width: '250px',
            render: (data) => `<div style="text-align: left;">${data || ''}</div>`,
        },
    ];

    const resetFilters = () => {
        setFilterDate('');
        setRefId('');
        setSelectedUser('');

        $(selectTeamRef.current).val(null).trigger('change');
        setStatus('');
        fetchFilteredQuotes();  // Fetch unfiltered data
    };

    return (
        <div className="container bg-gray-100 w-full add">
            <h1 className='text-xl font-bold'>Milestone Payments</h1>

            {/* Filter Section */}
            <div className="flex items-center space-x-2 my-4 bg-white p-2 rounded">
                <div className="w-1/2">
                    <input
                        id="filterDate"
                        type="text"
                        className="form-control"
                        placeholder="From Date - To Date"
                        value={filterDate}
                        readOnly // Make the input read-only as it's controlled by daterangepicker
                    />
                </div>
                <div className="w-1/2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder='Enter Ref. Id'
                        value={refId}
                        onChange={(e) => setRefId(e.target.value)}
                    />
                </div>
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
                        <option value="">Select Status</option>
                        <option value="1">Draft</option>
                        <option value="2">Approval Awaitng</option>
                        <option value="3">Approved</option>
                        <option value="4">Published</option>
                        <option value="5">Paid</option>
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
                            },
                        }}
                    />
                </div>
            )}

            <AnimatePresence>
                {showModal && selectedQuote && (
                    <MilestonePaymentDetails paymentDetails={selectedQuote} onClose={() => setShowModal(false)} finalFunction={fetchFilteredQuotes} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MilestonePayments;
