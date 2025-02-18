import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { PlusCircle, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import CustomLoader from '../../../components/CustomLoader';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';


const ManagePayment = () => {
    DataTable.use(DT);

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [startDate, setStartDate] = useState(null); // Store start date
    const [endDate, setEndDate] = useState(null); // Store end date
    const [statusFilter, setStatusFilter] = useState('');


    const tableRef = useRef(null);

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
                //fetchReports(start, end);
            }
        );
    }, []);

    const fetchReports = async (start, end) => {
        try {
            setLoading(true);

            const user_id = sessionStorage.getItem('id');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            const payload = {

                user_id,
                user_type
            };
            if (start && end) {
                payload.filter_date = `${start.format('MM/DD/YYYY')} - ${end.format('MM/DD/YYYY')}`;
            }

            if (statusFilter) {
                payload.status_filter = statusFilter;
            }

            const response = await axios.post('https://99crm.phdconsulting.in/api/getpayments', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch reports');
            }

            setTags(response.data.paymentData);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(error.message || 'Error fetching reports');
        } finally {
            setLoading(false);
        }
    };

    // Refresh button handler
    const handleRefresh = () => {
        setStartDate(null)
        setEndDate(null);
        setStatusFilter('');
        fetchReports();
    };




    useEffect(() => {
        fetchReports();
    }, []);

    const columns = [
        {
            title: 'Client Name',
            orderable: false,
            data: 'name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Client Email',
            orderable: false,
            data: 'email',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Service Name',
            orderable: false,
            data: 'service_name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Confirmation ID',
            orderable: false,
            data: 'confirmation_id',
            render: (data) => {
                return `<div style="text-align: center;">${data ?? "NA"}</div>`;
            },
        },
        {
            title: 'Payment Mode',
            orderable: false,
            data: 'mode',
            render: (data) => {
                return `<div style="text-align: center;">${data ?? "NA"}</div>`;
            },
        },
        {
            title: 'Amount',
            orderable: false,
            data: 'amount',
            render: (data, type, row) => {
                return `<div style="text-align: center;">${row.currency} ${data ?? "NA"}</div>`;
            },
        },
        {
            title: 'Posted Date',
            orderable: false,
            data: 'craeted_date',
            render: (data) => {
                return `<div style="text-align: center;"> ${data ?? "NA"}</div>`;
            },
        },
        {
            title: 'Status',
            orderable: false,
            data: 'status',
            render: (data) => {
                let statusLabel = '';
                if (data === 1) {
                    statusLabel = '<span class="inline-block px-3 py-1 text-gray-700 bg-gray-200 rounded-full text-sm">Pending</span>';
                } else if (data === 2) {
                    statusLabel = '<span class="inline-block px-3 py-1 text-yellow-700 bg-yellow-100 rounded-full text-sm">On Hold</span>';
                } else if (data === 3) {
                    statusLabel = '<span class="inline-block px-3 py-1 text-green-700 bg-green-100 rounded-full text-sm">Confirm</span>';
                } else if (data === 4) {
                    statusLabel = '<span class="inline-block px-3 py-1 text-red-700 bg-red-100 rounded-full text-sm">Reject</span>';
                } else {
                    statusLabel = '<span class="inline-block px-3 py-1 text-gray-700 bg-gray-200 rounded-full text-sm">NA</span>';
                }
                return `<div class="flex justify-center">${statusLabel}</div>`;
            },
        },
        {
            title: 'Action',
            orderable: false,
            data: null,
            render: (data, type, row) => {
                // Display total rows (actions count)
                return `<div style="text-align: center;"><button>View</button></div>`;
            },
        },
    ];




    return (
        <div>
            <div className="my-3 flex mx-auto rep">
                <div className='col-md-7 flex'>
                    <h1 className="text-md font-bold">Payments &nbsp;</h1>
                    <div className="w-1/2 ">
                        <input
                            id="filterDate"
                            type="text"
                            className="form-control"
                            placeholder="From Date - To Date"
                            value={filterDate}
                            readOnly
                        />
                    </div>
                    <div className="w-1/2 ">
                        <select
                            name="status_filter"
                            id="status_filter"
                            className="form-control"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Please Select Status</option>
                            <option value="1">Pending</option>
                            <option value="2">On Hold</option>
                            <option value="3">Confirm</option>
                            <option value="4">Reject</option>
                        </select>
                    </div>

                </div>
                <div className='ml-3 flex justify-end'>
                    <div className='flex mdbut'>

                        <button
                            onClick={handleRefresh}
                            className="text-gray-500 py-1 px-1 rounded hover:bg-gray-300"
                        >
                            <RefreshCw size={15} />
                        </button>
                        <button
                            onClick={fetchReports}
                            className="bg-green-600 w-36 px-2 ml-3 text-white rounded hover:bg-green-700"
                        >
                            Apply
                        </button>
                    </div></div>
            </div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white dtp-0 reportpage shadow-xl border-t-2 border-green-400 rounded  mx-auto'>
                    <DataTable
                        data={tags}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            order: false,
                            createdRow: (row, data) => {

                            },
                        }}
                    />
                </div>
            )}

            <AnimatePresence>

            </AnimatePresence>
        </div>
    );
};

export default ManagePayment;
