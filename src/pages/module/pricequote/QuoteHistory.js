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


const QuoteHistory = () => {
    const [quotes, setQuotes] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [refId, setRefId] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('')
    const [loading, setLoading] = useState(false);
    const selectTeamRef = useRef(null);

    DataTable.use(DT);


    useEffect(() => {
        // Fetch managers data from the API
        fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getallusers')
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
            const response = await axios.get(
                'https://99crm.phdconsulting.in/99crmwebapi/api/quote-history'
            );
            if (response.data.status) {
                setQuotes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFilteredQuotes = async () => {
      
        setLoading(true);
        try {
            const response = await axios.post(
                'https://99crm.phdconsulting.in/99crmwebapi/api/quote-history',
                {
                    filter_date: filterDate,
                    ref_id: refId,
                    user_id: selectedUser,
                    status: status,
                }
            );
            if (response.data.status) {
                setQuotes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching filtered quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Sr. No.',
            data: null,
            orderable: false,
            render: (data, type, row, meta) => {
                return `<div style="text-align: left;">${meta.row + 1}</div>`;
            },
        },
        {
            title: 'Ref Id',
            data: 'ref_id',
            orderable: true,
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
            title: 'Total Price',
            data: 'total_price',
            orderable: false,
            render: (data,type,row,meta) => `<div style="text-align: left;">${row.currency_type} ${ data }</div>`,
        },
        {
            title: 'Created Date',
            data: 'created_date',
            orderable: false,
            render: (data) => {
                return data ? new Date(data * 1000).toLocaleDateString() : 'N/A';
            },
        },
        {
            title: 'Expiry Date',
            data: 'expiry_date',
            orderable: false,
            render: (data) => {
                return data ? new Date(data * 1000).toLocaleDateString() : 'N/A';
            },
        },
        {
            title: 'Query Status',
            data: null,
            orderable: false,
            render: (data) => `<div style="text-align: left;">
            <button class="bg-orange-500 text-white py-1 px-2 rounded hover:bg-orange-600 mr-2 flex items-center" style={{fontSize: "12px !important"}}>
                Edit
            </button>
            </div>`,
        },
        {
            title: 'Status',
            data: 'status',
            orderable: false,
            render: (data) => {
                const statusMap = {
                    '1': { text: 'Draft', color: 'bg-yellow-500' },
                    '2': { text: 'Approval Awaiting', color: 'bg-red-500' },
                    '3': { text: 'Approved', color: 'bg-yellow-500' },
                    '4': { text: 'Published', color: 'bg-green-500' },
                    '5': { text: 'Paid', color: 'bg-green-500' }
                };
                
                const status = statusMap[data] || { text: 'N/A', color: 'bg-gray-500' };
                return `<div class="flex"><span style="font-size: 12px !important;" class="${status.color} text-white px-1 rounded-full text-sm">${status.text}</span></div>`;
            },
        },
        {
            title: 'Milestone',
            data: 'milestone',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data || 'N/A'}</div>`,
        },
    ];

    const resetFilters = () => {
        setFilterDate('');
        setRefId('');
        setSelectedUser('');
        
        $(selectTeamRef.current).val(null).trigger('change');
        setStatus('');
        fetchQuotes();  // Fetch unfiltered data
    };

    return (
        <div className="container bg-white w-full add">
            <h1 className='text-md font-bold mt-2 ml-2'>Generated Price Quote</h1>

            {/* Filter Section */}
            <div className="flex items-center space-x-2 my-2 bg-gray-50 p-2 rounded ">
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
                    <button className="bg-blue-400 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2 flex items-center" onClick={fetchFilteredQuotes}>
                        Apply Filters &nbsp;
                        <FilterIcon size={12} className="" />
                    </button>
                    <button className="text-gray-500 py-1 px-1 rounded hover:bg-gray-300" onClick={resetFilters}>
                        <RefreshCcw size={15}/>
                    </button>

                </div>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-2 border-t-2 border-green-400 rounded shadow-xl'>
                <DataTable
                    data={quotes}
                    columns={columns}
                    options={{
                        pageLength: 50,
                        createdRow: (row, data) => {
                            
                        },
                    }}
                />
                </div>
            )}

           
        </div>
    );
};

export default QuoteHistory;
