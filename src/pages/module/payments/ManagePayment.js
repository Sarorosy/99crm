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
import ViewPaymentDetails from './ViewPaymentDetails';
import AddPayment from './AddPayment';


const ManagePayment = () => {
    DataTable.use(DT);

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [startDate, setStartDate] = useState(null); // Store start date
    const [endDate, setEndDate] = useState(null); // Store end date
    const [statusFilter, setStatusFilter] = useState('1');


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

            const response = await axios.post('https://99crm.phdconsulting.in/zend/api/getpayments', payload, {
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

    const handleAddPayment = () => {
        setIsAddPaymentOpen(true);
    }


    useEffect(() => {
        fetchReports();
    }, []);
    const handleViewButtonClick = (data) => {
        setSelectedPayment(data);
        setIsModalOpen(true);

    }

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
                const formattedDate = data ? moment.unix(data).format('DD MMM, YYYY') : 'NA';
                return `<div style="text-align: center;">${formattedDate}</div>`;
            },
        },
        {
            title: 'Status',
            orderable: false,
            data: 'status',
            render: (data) => {
                let statusLabel = '';
                if (data === 1) {
                    statusLabel = '<span class="bg-gray-700 badge">Pending</span>';
                } else if (data === 2) {
                    statusLabel = '<span class="bg-yellow-700 badge elevenpx">On Hold</span>';
                } else if (data === 3) {
                    statusLabel = '<span class="bg-green-700 badge">Confirm</span>';
                } else if (data === 4) {
                    statusLabel = '<span class="bg-red-700 badge">Reject</span>';
                } else {
                    statusLabel = '<span class="bg-gray-700 badge">NA</span>';
                }
                return `<div class="flex justify-center" style="font-size: 12px;">${statusLabel}</div>`;
            },
        },
        {
            title: 'Action',
            orderable: false,
            data: null,
            render: (data, type, row) => {
                return `
                    <div style="text-align: center;">
                        <button style="font-size: 12px;" class="view-btn bg-blue-500 hover:bg-blue-600 text-white px-1 flex items-center justify-center rounded-md text-sm transition duration-150 ease-in-out">
                            View
                        </button>
                    </div>`;
            },
        },
    ];




    return (
        <div>
            <div className="bg-gray-100 rounded-lg px-2 py-2 mb-2 flex justify-between mx-auto">
                <div className='flex items-center'>
                    <h1 className="text-md font-bold">Payments &nbsp;</h1>
                </div>
                <div className='flex items-center justify-end gap-2'>
                    <div className="">
                        <input
                            id="filterDate"
                            type="text"
                            className="form-control form-control-sm f-12"
                            placeholder="From Date - To Date"
                            value={filterDate}
                            readOnly
                        />
                    </div>
                    <div className="">
                        <select
                            name="status_filter"
                            id="status_filter"
                            className="form-select form-select-sm f-12"
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

                    <div>
                    <button
                        onClick={handleRefresh}
                        className="btn btn-light btn-sm f-10 px-1"
                    >
                        <RefreshCw size={14} />
                    </button>
                    </div>
                    <div>
                    <button
                        onClick={fetchReports}
                        className="btn btn-primary btn-sm f-10"
                    >
                        Apply
                    </button>
                    </div>
                    {sessionStorage.getItem('user_type') === 'user' && (
                        <div>
                        <button
                            onClick={handleAddPayment}
                            className="btn btn-success btn-sm f-10"
                        >
                            Add Payment
                        </button>
                        </div>
                    )}


                </div>
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
                                $(row).find('.view-btn').on('click', () => {
                                    handleViewButtonClick(data);
                                });
                            },
                        }}
                    />
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && <ViewPaymentDetails paymentDetails={selectedPayment} onClose={() => setIsModalOpen(false)} finalFunction={fetchReports} />}
                {isAddPaymentOpen && <AddPayment onClose={() => setIsAddPaymentOpen(false)} finalFunction={fetchReports} />}
            </AnimatePresence>
        </div>
    );
};

export default ManagePayment;
