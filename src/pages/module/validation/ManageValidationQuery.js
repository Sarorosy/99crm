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
import { RefreshCcw, FilterIcon, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


const ManageValidationQuery = () => {
    const [quotes, setQuotes] = useState([]);
    const [totalQuotes, setTotalQuotes] = useState([]);
    const [approvedQuotes, setApprovedQuotes] = useState([]);
    const [onHoldQuotes, setOnHoldQuotes] = useState([]);
    const [rejectedQuotes, setRejectedQuotes] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [keywords, setKeywords] = useState('');
    const [status, setStatus] = useState('');
    const [websites, setWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState('')
    const [loading, setLoading] = useState(false);
    const selectTeamRef = useRef(null);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showModal, setShowModal] = useState(false);

    DataTable.use(DT);


    useEffect(() => {
        // Fetch managers data from the API
        fetch('https://99crm.phdconsulting.in/99crmwebapi/api/websites')
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
                'https://99crm.phdconsulting.in/api/loadvalidation',{
                    user_id: sessionStorage.getItem('id'),
                    user_type: sessionStorage.getItem('user_type'),
                    crmroletype: sessionStorage.getItem('crmRoleType'),
                    assignType: status,
                    search_keywords: keywords,
                    filter_date: filterDate,
                    website: selectedWebsite,
                }
            );
            if (response.data.status) {
                setQuotes(response.data.queryData ?? []);
                setTotalQuotes(response.data.totalData ?? []);
                setApprovedQuotes(response.data.approveData ?? []);
                setOnHoldQuotes(response.data.holdData ?? []);
                setRejectedQuotes(response.data.rejectData ?? []);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = (quote) => {
        setSelectedQuote(quote);
        setShowModal(true);
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
            ${row.duplicate != "" ? `<span class="text-red-700 bg-red-100 p-1 rounded">Duplicate</span>` : ''}
            </div>`,
        },
        {
            title: 'Assigned',
            data: 'username',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data}</div>`,
        },
        {
            title: 'Assign Type',
            data: 'assignType',
            orderable: false,
            render: (data) => `<div style="text-align: left;">${data || 'N/A'}</div>`,
        },
        {
            title: 'Website',
            data: null,
            orderable: false,
            render: (data, type, row) => `<div style="text-align: left;">${row.website == "others" ? row.other_website : row.website}</div>`,
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
            title: 'Status',
            data: 'validation_status',
            orderable: false,
            render: (data, type, row) => {
                let statusHtml = '';
                if (data == 'Approved') {
                    statusHtml = `<span class="bg-green-500 text-white p-1 rounded">${data}</span>`;
                } else if (data == 'On Hold') {
                    statusHtml = `<span class="bg-yellow-500 text-white p-1 rounded">On Hold >> Validation team is unable to contact</span>`;
                } else if (data == 'Rejected') {
                    statusHtml = `<span class="bg-red-500 text-white p-1 rounded">Rejected >> No requirement/client refused requirement.</span>`;
                }

                let commentHtml = '';
                if (row.approved_comment) {
                    commentHtml = `<br><br>Comment: ${row.approved_comment}`;
                } else if (row.reject_comment) {
                    commentHtml = `<br><br>Comment: ${row.reject_comment}`;
                }

                return `<div style="text-align: left;font-size: 10px;">${statusHtml}${commentHtml}</div>`;
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
        setStatus('');
        fetchQuotes();  // Fetch unfiltered data
    };

    return (
        <div className="container bg-gray-100 w-full add">
            <h1 className='text-xl font-bold'>Validation Query</h1>

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
                        placeholder='Enter Keywords Name or Email or Phone'
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                    />
                </div>
                <div className="w-1/2">
                    <select
                        id="user_id"
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
                <div className="w-1/2">
                    
                    <select
                        className="form-control"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                            <option value="">Select validation status</option>
                            <option value="Approved">Approved</option>
                            <option value="On Hold"> On Hold &gt;&gt; Validation team is unable to contact</option>
                            <option value="Rejected"> Rejected &gt;&gt; No requirement/client refused requirement.</option>
    
                    </select>
                </div>
                <div className="w-1/2 flex items-center space-x-2 last">
                    <label>&nbsp;</label>
                    <button className="bg-blue-400 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2 flex items-center" onClick={fetchQuotes}>
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
                <>
                <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-2 text-xs ' style={{fontSize: "12px !important"}}>
                        <div style={{fontSize: "12px !important"}} className='bg-sky-600 text-white px-2 py-1 rounded-md shadow-sm  transition-colors'>
                            Total: {totalQuotes.length}
                        </div>
                        <div style={{fontSize: "12px !important"}} className='bg-green-600 text-white px-2 py-1 rounded-md shadow-sm transition-colors'>
                            Approved: {approvedQuotes.length}
                        </div>
                        <div style={{fontSize: "12px !important"}} className='bg-orange-600 text-white px-2 py-1 rounded-md shadow-sm transition-colors'>
                            Hold: {onHoldQuotes.length}
                        </div>
                        <div style={{fontSize: "12px !important"}} className='bg-red-500 text-white px-2 py-1 rounded-md shadow-sm transition-colors'>
                            Rejected: {rejectedQuotes.length}
                        </div>
                    </div>
                </div>
                <div className='bg-white p-2 border-t-2 border-green-400 rounded'>
                <DataTable
                    data={quotes}
                    columns={columns}
                    options={{
                        pageLength: 50,
                        createdRow: (row, data) => {
                            $(row).find('.view-btn').click(function() {
                                handleViewClick(data);
                            });
                        },
                    }}
                />
                </div>
                </>
            )}

            <AnimatePresence>  
                {showModal && (
                    // ... existing code ...
                    <motion.div 
                        className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="h-full w-1/3 bg-white shadow-lg"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                        >
                            <div className="p-6">
                                <div className='flex items-center justify-between'>
                                <h2 className="text-lg font-bold mb-4">Validation Query Details</h2>
                               <button className='bg-red-500 text-white px-2 py-1 rounded-md shadow-sm hover:bg-red-600 transition-colors'>
                                <X size={15} onClick={() => setShowModal(false)}/>
                               </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
// ... existing code ...
                )}
            </AnimatePresence>
           
        </div>
    );
};

export default ManageValidationQuery;
