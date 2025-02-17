import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import CustomLoader from '../../../../components/CustomLoader';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { ConfirmationModal } from '../../../../components/ConfirmationModal';
import { AnimatePresence, motion } from 'framer-motion';
import AddFollowupSetting from './AddFollowupSetting';
import EditFollowupSetting from './EditFollowupSetting';

const ManageFollowupSetting = () => {
    DataTable.use(DT);

    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [selectedSettings, setSelectedSettings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingSetting, setIsAddingSetting] = useState(false);
    const [isEditingSetting, setIsEditingSetting] = useState(false);

    const tableRef = useRef(null);

    const toggleAddSettingVisibility = () => {
        setIsAddingSetting(!isAddingSetting);
    };

    const toggleEditSettingVisibility = () => {
        setIsEditingSetting(!isEditingSetting);
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getfollowupsetting');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSettings(data.data);
        } catch (error) {
            toast.error('Failed to load follow-up settings.');
            console.error('Error fetching follow-up settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (selectedSettings.length === 0) {
            toast.error("Please select at least one setting to delete.");
            return;
        }
        setIsModalOpen(true);
    };

    const onConfirmDelete = async () => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/deletefollowupsetting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedSettings }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete settings');
            }

            setSettings(settings.filter((setting) => !selectedSettings.includes(setting.id)));
            toast.success('Settings deleted successfully!');
            setTimeout(() => {
                fetchSettings();
            }, 1000);

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting settings.');
        } finally {
            setIsModalOpen(false);
            setSelectedSettings([]);
            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };

    const handleEditButtonClick = (setting) => {
        console.log('Selected setting for edit:', setting); // Log to ensure we are selecting the correct setting
        setSelectedSetting(setting);
        setIsEditingSetting(true);  // Open the edit modal
    };

    useEffect(() => {
        fetchSettings();
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
            title: 'Priority Name',
            orderable: false,
            data: 'priority',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Follow-Up Days',
            data: 'follow_up_day',
            orderable: false,
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Contact By',
            data: 'contact_by',
            orderable: false,
            render: (data) => data.replaceAll(',', ', '),
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
        <button class="edit-btn btn btn-sm mx-1" data-id="${row.id}">
            <img src="https://99crm.phdconsulting.in/public/images/edit.gif" alt="edit" />
        </button>
      `,
        },
    ];

    const handleCheckboxClick = (event) => {
        const id = $(event.target).data('id');
        setSelectedSettings((prev) =>
            $(event.target).is(':checked') ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
        );
    };

    const handleRefresh = () => {
        fetchSettings();
    };

    return (
        <div>
            <div className="my-3 flex justify-between w-2/3 mx-auto">
                <h1 className="text-md font-bold">Follow-up Settings</h1>
                <div className='flex mdbut'>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-3 flex items-center"
                    >
                        <Trash2 className="mr-1" size={12} />
                        Delete
                    </button>
                    <button
                        onClick={toggleAddSettingVisibility}
                        className="btn btn-success text-white py-1 px-2 rounded flex items-center mr-2"
                    >
                        <PlusCircle className="mr-1" size={12} />
                        Add Priority
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
                <div className='bg-white p-3 shadow-xl border-t-2 border-green-400 rounded w-2/3 mx-auto'>
                    <DataTable
                        data={settings}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            createdRow: (row, data) => {
                                $(row).find('.edit-btn').on('click', () => handleEditButtonClick(data));
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
                        message: `Are you sure you want to delete ${selectedSettings.length} setting(s)?`,
                    }}
                    onConfirm={onConfirmDelete}
                    isReversible={false}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            
            <AnimatePresence>
                {isAddingSetting && (
                    <AddFollowupSetting
                        onClose={toggleAddSettingVisibility}
                        afterSave={handleRefresh}
                        setting={selectedSetting}
                    />
                )}
                {isEditingSetting && selectedSetting && ( // Ensure selectedSetting is not null
                    <EditFollowupSetting
                        onClose={toggleEditSettingVisibility}
                        afterSave={handleRefresh}
                        setting={selectedSetting}  
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageFollowupSetting;
