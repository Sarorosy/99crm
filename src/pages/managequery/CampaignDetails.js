import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.css';
import 'select2';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX } from 'lucide-react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import CustomLoader from '../../components/CustomLoader';

const CampaignDetails = ({ onClose, CampaignId }) => {
    DataTable.use(DT);
    const [campaignInfo, setCampaignInfo] = useState(null);
    const [queryData, setQueryData] = useState([]);
    const [selectedQueries, setSelectedQueries] = useState([]);
    const selectTeamRef = useRef(null);

    useEffect(() => {
        // Fetch campaign details using CampaignId via POST request
        const fetchCampaignDetails = async () => {
            try {
                const response = await fetch(`https://99crm.phdconsulting.in/api/camp-details`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ campid: CampaignId }), // Send CampaignId as raw JSON
                });
                const data = await response.json();
                if (data.status) {
                    setCampaignInfo(data.campaignInfo);
                    setQueryData(data.queryData);
                } else {
                    toast.error('Failed to fetch campaign details');
                }
            } catch (error) {
                console.error('Error fetching campaign details:', error);
                toast.error('An error occurred while fetching campaign details');
            }
        };

        fetchCampaignDetails();
    }, [CampaignId]);

    const columns = [
        {
            title: 'Ref No.',
            orderable: false,
            data: 'assign_id',
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

                return `
            <div style="text-align: left; cursor: pointer;" data-tooltip-id="my-tooltip" data-tooltip-content="${row.name}">
                ${data} 
            </div>
        `;
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
            title: 'Tags',
            orderable: false,
            data: 'arrTag',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Camp Status',
            orderable: false,
            data: 'campQuerySts',
            render: (data, type, row) => {
                let statusText = 'Pending';

                // Check if campStatusDatas is not empty and set appropriate status
                if (row.campStatusDatas && row.campStatusDatas.status === false) {
                    // Status not found, handle "Not Allocated"
                    statusText = 'Not Allocated';
                } else if (row.alreadyReplicate && row.alreadyReplicate.alreadyReplicate === false) {
                    // If query is not replicated, set "Assigned"
                    statusText = 'Assigned';
                }

                return `<div style="text-align: left;">${statusText}</div>`;
            },
        },

        {
            title: 'Status',
            orderable: false,
            data: 'statusInfo',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Action Status',
            orderable: false,
            data: 'campQuerySts',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${(data == '' || data == null) ? 'Pending' : data}</div>`;
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <h2 className="text-xl text-center font-semibold mb-4">Campaign Details</h2>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-gray-600 hover:text-red-600 transition-colors"
            >
                <CircleX size={28} />
            </button>

            <div className="mb-6">
                {campaignInfo ? (
                    <div className="py-2 px-3 shadow-md rounded flex flex-wrap bluec">
                        <div className="flex-1 ">
                            <p><strong>Camp Title:</strong> {campaignInfo.camp_title}</p>
                        </div>
                        <div className="flex-1 max-w-[200px]">
                            <p><strong>Camp Date:</strong> {campaignInfo.camp_date}</p>
                        </div>
                        <div className="flex-1">
                            <p><strong>Camp Website:</strong> {campaignInfo.website_name}</p>
                        </div>
                        <div className="flex-1">
                            <p><strong>Assigned User:</strong> {campaignInfo.user_name}</p>
                        </div>
                        <div className="flex-1 max-w-[200px]">
                            <p><strong>Total Queries:</strong> {campaignInfo.queryIds.split(',').length}</p>
                        </div>
                    </div>
                ) : (
                    <CustomLoader />
                )}
            </div>



            <div className='bg-white p-3 shadow-xl border-t-2 border-blue-400 rounded mx-auto'>
                <h3 className="text-lg font-semibold">Query Data</h3>
                <div style={{ overflowX: 'auto', maxWidth: '100%', maxHeight:'25rem' }}>
                    <DataTable
                        data={queryData}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            ordering: false,
                            createdRow: (row, data, index) => {
                                $(row).css('font-size', '12px !important');
                                if (index % 2 === 0) {
                                    $(row).addClass('bg-gray-100'); // Light gray for even rows
                                } else {
                                    $(row).addClass('bg-white'); // White for odd rows
                                }
                                $(row).find('.checkbox').on('click', handleCheckboxClick);
                            },
                        }}
                    />
                </div>
            </div>

            <ToastContainer />
        </motion.div>
    );
};

export default CampaignDetails;
