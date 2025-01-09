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
            // Constructing the request body with the selected settings IDs
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

            const data = await response.json();

            setSettings(settings.filter((setting) => !selectedSettings.includes(setting.id)));
            toast.success('Settings deleted successfully!');
            setTimeout(() => {
                fetchSettings();
            }, 1000)

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
        setSelectedSetting(setting);
        setIsEditingSetting(true);
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
                return `<div style="text-align: center;">${meta.row + 1}</div>`;
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
            render: (data) => data.replaceAll(',', ', '), // Format with spaces
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
                <h1 className="text-2xl font-bold">Follow-up Settings</h1>
                <div className='flex '>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-2 flex items-center"
                    >
                        <Trash2 className="mr-3" />
                        Delete
                    </button>
                    <button
                        onClick={toggleAddSettingVisibility}
                        className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2 flex items-center"
                    >
                        <PlusCircle className="mr-3" />
                        Add Priority
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="bg-gray-500 text-white py-1 px-2 rounded hover:bg-gray-600 flex items-center"
                    >
                        <RefreshCw className="mr-3" />
                        Refresh
                    </button>
                </div>
            </div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-2 shadow-xl border-t-2 border-blue-400 rounded w-2/3 mx-auto'>
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
            <ToastContainer />
            <AnimatePresence>
                {isAddingSetting && (

                    <AddFollowupSetting
                        onClose={toggleAddSettingVisibility}
                        afterSave={handleRefresh}
                        setting={selectedSetting}
                    />

                )}

                {isEditingSetting && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <EditFollowupSetting
                            onClose={toggleEditSettingVisibility}
                            afterSave={handleRefresh}
                            settingId={selectedSetting}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageFollowupSetting;
