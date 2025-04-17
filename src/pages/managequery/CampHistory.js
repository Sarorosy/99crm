import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import { PlusCircle, RefreshCw, Pencil, Trash2, SearchIcon, Plus } from 'lucide-react';
import CustomLoader from '../../components/CustomLoader';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import CampaignDetails from './CampaignDetails';


const CampHistory = () => {
    DataTable.use(DT);

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQueries, setSelectedQueries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState("");
    const userType = sessionStorage.getItem('user_type');



    const websiteRef = useRef(null);
    const tagsRef = useRef(null);

    const navigate = useNavigate();



    const fetchQueries = async () => {
        try {
            setLoading(true);

            const payload = {
                user_id: sessionStorage.getItem('id'),
                user_type: sessionStorage.getItem('user_type')
            };

            const response = await axios.post('https://99crm.phdconsulting.in/zend/api/loadcampaignhistory', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch reports');
            }
            if (response.data.status) {
                setReports(response.data.campaignData);
            } else {
                toast.error(response.data.message || "an error occured");
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error(error.message || 'Error fetching reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    const handleMarkAsComplete = async (id, row) => {
        try {


            const payload = {
                camp_id: id
            };

            const response = await axios.post('https://99crm.phdconsulting.in/zend/api/campaignstatuschange', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });


            if (response.status !== 200) {
                throw new Error('Failed to fetch reports');
            }
            if (response.data.status) {
                toast.success(response.data.message);
                fetchQueries();
            } else {
                toast.error(response.message || "an error occured");
            }
        } catch (error) {
            console.error('Error fetching reports:', error);

        }
    };


    const columns = [
        {
            title: 'Sel',
            data: 'id',
            width: '50px',
            orderable: false,
            render: (data) => {
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
            },
        },
        {
            title: 'Camp Title',
            orderable: false,
            data: 'camp_title',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Camp Date',
            orderable: false,
            data: 'camp_date',
            render: (data, type, row) => {
                if (!data) {
                    return '<div style="text-align: left;">-</div>';
                }

                const date = new Date(data);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                return `<div style="text-align: left;">${formattedDate}</div>`;
            },
        },

        {
            title: 'Website',
            orderable: false,
            data: 'website_name',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data ? data : 'Generic Query'}</div>`;
            },
        },
        {
            title: 'Assigned to',
            orderable: false,
            data: 'user_name',
            render: (data, type, row) => {
                return `<div style="text-align: left;">${data ? data : 'Generic Query'}</div>`;
            },
        },
        {
            title: 'Status',
            orderable: false,
            data: 'status',
            render: (data, type, row) => {
                const userType = sessionStorage.getItem('user_type'); // Get user type from sessionStorage

                if (data == 1) {
                    return `<div style="text-align: left;">Completed</div>`;
                } else {
                    return `
                        <div style="text-align: left;">
                            Pending <br/>
                            ${userType === 'Campaign Manager' ?
                            `<button 
                                    class="mark-completed-btn bg-blue-500 text-white rounded px-2 py-1 mt-2"
                                    data-id="${row.id}"
                                >
                                    Mark as Completed
                                </button>` : ''
                        }
                        </div>`;
                }
            }
        },
        {
            title: 'Total Query',
            orderable: false,
            data: 'queryIds',
            render: (data, type, row) => {
                const count = data ? data.split(',').length : 0;
                return `
                    <div style="text-align: center;">
                        <span 
                            class="tqc p-1 rounded-full cursor-pointer count-span" 
                            data-id="${row.id}" 
                            count-span>
                            ${count}
                        </span>
                    </div>`;
            },
        },


        {
            title: 'Created Date',
            orderable: false,
            data: 'assign_campaign_date',
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




    const handleDelete = () => {
        if (selectedQueries.length === 0) {
            toast.error("Please select at least one query to delete.");
            return;
        }
        setIsModalOpen(true);
    };

    const onConfirmDelete = async () => {
        try {
            // Constructing the request body with the selected reports IDs
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/deletecampaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ campaign_ids: selectedQueries }),
            });


            if (!response.ok) {
                throw new Error('Failed to delete Reports');
            }

            const data = await response.json();
            toast.success('Query(s) deleted successfully!');
            setReports(reports.filter((setting) => !selectedQueries.includes(setting.id)));

            setTimeout(() => {
                fetchQueries();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting queries.');
        } finally {

            setIsModalOpen(false);
            setSelectedQueries([]);


            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };


    return (
        <div>
            <div className="my-3 flex justify-between flex-col mx-auto">
                <div className='flex w-full justify-between px-0'>
                    <h1 className="text-md font-bold">Campaign History</h1>
                </div>
                
            </div>



            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-3 shadow-xl border-t-2 border-green-400 rounded mx-auto'>
                    <div className='w-full flex items-center justify-end mb-1'>
                        <button
                            onClick={handleDelete}
                            className=" bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-3 flex items-center"
                        >
                            <Trash2 className='mr-2' size={14} />  Delete
                        </button>
                        <button
                            onClick={fetchQueries}
                            className="text-gray-500 py-1 px-1 rounded hover:bg-gray-300"
                        >
                            <RefreshCw size={15} />
                        </button>

            

                    </div>
                    <div>
                        <DataTable
                            data={reports}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,
                                createdRow: (row, data, index) => {
                                    $(row).css('font-size', '12px !important');
                                    $(row).find('.checkbox').on('click', handleCheckboxClick);
                                    $(row).find('.mark-completed-btn').on('click', function () {
                                        handleMarkAsComplete(data.id, row);
                                    });
                                    $(row).on('click', '.count-span', function () {
                                        const id = $(this).data('id'); // Get the ID from the clicked element
                                        setSelectedCamp(id); // Call the React state updater function
                                        setDetailsOpen(true);
                                    });
                                    if (index % 2 === 0) {
                                        $(row).addClass('bg-gray-100'); // Light gray for even rows
                                    } else {
                                        $(row).addClass('bg-white'); // White for odd rows
                                    }

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
                        message: `Are you sure you want to delete ${selectedQueries.length} query(s)?`,
                    }}
                    onConfirm={onConfirmDelete}
                    isReversible={false}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            <AnimatePresence>
                {detailsOpen && (
                    <CampaignDetails CampaignId={selectedCamp} onClose={() => { setDetailsOpen(!detailsOpen) }} />
                )}
            </AnimatePresence>
            <Tooltip id="my-tooltip" />
        </div>
    );
};

export default CampHistory;
