import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { PlusCircle, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import CustomLoader from '../../../../components/CustomLoader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmationModal } from '../../../../components/ConfirmationModal';
import { AnimatePresence, motion } from 'framer-motion';
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';


const ManageReports = () => {
    DataTable.use(DT);

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [startDate, setStartDate] = useState(null); // Store start date
    const [endDate, setEndDate] = useState(null); // Store end date

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
                fetchReports(start, end);
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

            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/reports', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch reports');
            }

            setTags(response.data.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(error.message || 'Error fetching reports');
        } finally {
            setLoading(false);
        }
    };

    // Refresh button handler
    const handleRefresh = () => {
        if (startDate && endDate) {
            fetchReports(startDate, endDate); // Pass start and end dates to fetchReports
        } else {
            toast.error('Please select a date range first');
        }
    };



    const handleDelete = () => {
        if (selectedTags.length === 0) {
            toast.error("Please select at least one setting to delete.");
            return;
        }
        setIsModalOpen(true);
    };

    const onConfirmDelete = async () => {
        try {
            // Constructing the request body with the selected tags IDs
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/deleteboxtag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedTags }),
            });


            if (!response.ok) {
                throw new Error('Failed to delete tags');
            }

            const data = await response.json();

            setTags(tags.filter((setting) => !selectedTags.includes(setting.id)));
            toast.success('Tags deleted successfully!');
            setTimeout(() => {
                fetchReports();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting tags.');
        } finally {

            setIsModalOpen(false);
            setSelectedTags([]);


            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };



    useEffect(() => {
        fetchReports();
    }, []);

    const columns = [
        {
            title: 'User Name',
            orderable: false,
            data: 'username',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'No. of Query',
            orderable: false,
            data: 'query_count',
            render: (data) => {
                return `<div style="text-align: center;">${data}</div>`;
            },
        },
        {
            title: 'Average TAT',
            orderable: false,
            data: 'average_tat',
            render: (data, type, row) => {
                // Calculate average TAT in minutes
                const averageTAT = (row.total_minute / row.total_rows).toFixed(2);
                return `<div style="text-align: center;">${data}</div>`;
            },
        },
        {
            title: 'Average TAT Score',
            orderable: false,
            data: 'average_score',
            render: (data, type, row) => {
                // Calculate average TAT score
                const averageTATScore = (row.total_score / row.total_rows).toFixed(2);
                return `<div style="text-align: center;">${data}</div>`;
            },
        },
        {
            title: 'No of Actions',
            orderable: false,
            data: 'total_rows',
            render: (data, type, row) => {
                // Display total rows (actions count)
                return `<div style="text-align: center;">${data}</div>`;
            },
        },
    ];



    const handleCheckboxClick = (event) => {
        const id = $(event.target).data('id');
        setSelectedTags((prev) =>
            $(event.target).is(':checked') ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
        );
    };


    return (
        <div>
            <div className="my-3 flex w-2/3 mx-auto rep">
                <div className='col-md-7 flex'>
                    <h1 className="text-2xl font-bold">Reports &nbsp;</h1>
                    <div className="w-1/2 datereports">
                        <input
                            id="filterDate"
                            type="text"
                            className="form-control"
                            placeholder="From Date - To Date"
                            value={filterDate}
                            readOnly // Make the input read-only as it's controlled by daterangepicker
                        />
                    </div></div>
                <div className='col-md-5 flex justify-end'>
                    <div className='flex mdbut'>

                        <button
                            onClick={handleRefresh}
                            className="text-white py-1 px-2 rounded bg-gray-500 hover:bg-gray-600 flex items-center "
                        >
                            <RefreshCw className="mr-2" size={12} />
                            Refresh
                        </button>
                    </div></div>
            </div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-2 reportpage shadow-xl border-t-2 border-blue-400 rounded w-2/3 mx-auto' style={{ overflowX: 'auto', maxWidth: '100%', maxHeight:'27rem' }}>
                    <DataTable
                        data={tags}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            createdRow: (row, data) => {
                                $(row).find('.checkbox').on('click', handleCheckboxClick);
                            },
                        }}
                    />
                </div>
            )}
            {isModalOpen && (
                <ConfirmationModal
                    context={{
                        title: 'Confirm Deletion',
                        message: `Are you sure you want to delete ${selectedTags.length} setting(s)?`,
                    }}
                    onConfirm={onConfirmDelete}
                    isReversible={false}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <ToastContainer />
            <AnimatePresence>

            </AnimatePresence>
        </div>
    );
};

export default ManageReports;
