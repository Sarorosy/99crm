import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { PlusCircle, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import CustomLoader from '../../../../components/CustomLoader';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmationModal } from '../../../../components/ConfirmationModal';
import { AnimatePresence, motion } from 'framer-motion';
import AddEmailCampaign from './AddEmailCampaign';
import ProcessEmailCampaign from './ProcessEmailCampaign';
import ViewEmailCampaign from './ViewEmailCampaign';
import CopyEmailCampaign from './CopyEmailCampaign';

const ManageEmailCampaign = () => {
    DataTable.use(DT);

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingSetting, setIsAddingSetting] = useState(false);
    const [isEditingSetting, setIsEditingSetting] = useState(false);

    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isCopyOpen, setIsCopyOpen] = useState(false);

    const [selectedCampaignId, setSelectedCampaignId] = useState(null);

    const tableRef = useRef(null);

    const toggleAddSettingVisibility = () => {
        setIsAddingSetting(!isAddingSetting);
    };
    const toggleEditSettingVisibility = () => {
        setIsEditingSetting(!isEditingSetting);
    };

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getallcampaigns');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTags(data.data);
        } catch (error) {
            console.error('Error fetching tags:', error);
        } finally {
            setLoading(false);
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
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/deleteemailcampaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedTags }),
            });


            if (!response.ok) {
                throw new Error('Failed to delete campaigns');
            }

            const data = await response.json();

            setTags(tags.filter((setting) => !selectedTags.includes(setting.id)));
            toast.success('Campaigns deleted successfully!');
            setTimeout(() => {
                fetchTags();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting campaigns.');
        } finally {

            setIsModalOpen(false);
            setSelectedTags([]);


            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };


    const handleProcessClick = (id) => {
        setSelectedCampaignId(id);
        setIsProcessOpen(true);
    };

    const handleViewClick = (id) => {
        setSelectedCampaignId(id);
        setIsViewOpen(true);
    };

    const handleCopyClick = (id) => {
        setSelectedCampaignId(id);
        setIsCopyOpen(true);
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const columns = [
        {
            title: 'Sel',
            data: 'id',
            orderable: false,
            render: (data) => {
                return `<input type="checkbox" data-id="${data}" class="checkbox" />`;
            },
        },
        {
            title: 'Sr No.',
            data: null,
            orderable: false,
            render: (data, type, row, meta) => {
                return `<div style="text-align: left;">${meta.row + 1}</div>`;
            },
        },
        {
            title: 'Campaign ID',
            orderable: false,
            data: 'campaignid',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Subject',
            orderable: false,
            data: 'camp_title',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Website',
            orderable: false,
            data: 'website_name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Opened',
            orderable: false,
            data: 'null',
            render: (data) => {
                return `<div style="text-align: left;"></div>`;
            },
        },
        {
            title: 'Status',
            orderable: false,
            data: 'status',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => {
                if (row.status === 'In Process') {
                    return `
                        <button class="proceed-btn bg-blue-400 py-0 px-1 text-white mx-1 rounded" data-id="${row.id}">
                            Proceed
                        </button>
                    `;
                } else {
                    return `
                        <button class="view-btn  mx-1 bg-blue-400 py-0 px-1 text-white rounded " data-id="${row.id}">
                            View
                        </button>
                        <button class="copy-btn bg-blue-400 py-0 px-1 text-white mx-1 rounded" data-id="${row.id}">
                            Copy
                        </button>
                    `;
                }
            },
        },

    ];


    const handleCheckboxClick = (event) => {
        const id = $(event.target).data('id');
        setSelectedTags((prev) =>
            $(event.target).is(':checked') ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
        );
    };

    const handleRefresh = () => {
        fetchTags();
    };

    return (
        <div>
            <div className="my-3 flex justify-between mx-auto">
                <h1 className="text-2xl font-bold">Email Campaign</h1>
                <div className='flex mdbut'>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-3 flex items-center"
                    >
                        <Trash2 className="mr-2" size={12} />
                        Delete
                    </button>
                    <button
                        onClick={toggleAddSettingVisibility}
                        className="btn btn-success text-white py-1 px-2 rounded flex items-center mr-3"
                    >
                        <PlusCircle className="mr-2" size={12} />
                        Add Email Campaign
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="bg-gray-200 text-gray-500 py-1 px-2 rounded hover:bg-gray-300"
                    >
                        <RefreshCw size={15}/>
                    </button>
                </div>
            </div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-2 shadow-xl border-t-2 border-blue-400 rounded mx-auto'>
                    <DataTable
                        data={tags}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            createdRow: (row, data) => {
                                $(row).find('.proceed-btn').on('click', () => handleProcessClick(data));
                                $(row).find('.view-btn').on('click', () => handleViewClick(data));
                                $(row).find('.copy-btn').on('click', () => handleCopyClick(data));
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
            <AnimatePresence>
                {isProcessOpen && (

                    <ProcessEmailCampaign
                        onClose={() => { setIsProcessOpen(!isProcessOpen) }}
                        afterSave={handleRefresh}
                        campaignId={selectedCampaignId}
                    />

                )}
                {isViewOpen && (

                    <ViewEmailCampaign
                        onClose={() => { setIsViewOpen(!isViewOpen) }}
                        afterSave={handleRefresh}
                        campaignId={selectedCampaignId}
                    />

                )}

                {isAddingSetting && (

                    <AddEmailCampaign
                        onClose={() => { setIsAddingSetting(!isAddingSetting) }}
                        afterSave={handleRefresh}
                        campaignId={selectedCampaignId}
                    />

                )}
                {isCopyOpen && (

                    <CopyEmailCampaign
                        onClose={() => { setIsCopyOpen(!isCopyOpen) }}
                        afterSave={handleRefresh}
                        campaignId={selectedCampaignId}
                    />

                )}


            </AnimatePresence>
        </div>
    );
};

export default ManageEmailCampaign;
