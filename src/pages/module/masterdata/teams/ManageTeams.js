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
import AddTeam from './AddTeam';
import EditTeam from './EditTeam';

const ManageTeams = () => {
    DataTable.use(DT);

    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setselectedTeam] = useState(null);
    const [selectedTeams, setselectedTeams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingTeam, setisAddingTeam] = useState(false);
    const [isEditingTeam, setisEditingTeam] = useState(false);

    const tableRef = useRef(null);

    const toggleAddSettingVisibility = () => setisAddingTeam(!isAddingTeam);
    const toggleEditSettingVisibility = () => setisEditingTeam(!isEditingTeam);

    const fetchteams = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getteams');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSettings(data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = () => {
        if (selectedTeams.length === 0) {
            toast.error("Please select at least one to delete.");
            return;
        }
        setIsModalOpen(true);
    };

    const onConfirmDelete = async () => {
        try {
            // Constructing the request body with the selected settings IDs
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/deleteteams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedTeams }),
            });


            if (!response.ok) {
                throw new Error('Failed to delete teams');
            }

            const data = await response.json();

            setSettings(settings.filter((setting) => !selectedTeams.includes(setting.id)));
            toast.success('Teams deleted successfully!');
            setTimeout(() => {
                fetchteams();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting teams.');
        } finally {

            setIsModalOpen(false);
            setselectedTeams([]);


            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };


    const handleEditButtonClick = (setting) => {
        setselectedTeam(setting);
        setisEditingTeam(true);
    };

    useEffect(() => {
        fetchteams();
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
            title: 'Team Name',
            orderable: false,
            data: 'team_name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Team Manager',
            data: 'team_manager',
            orderable: false,
            render: (data) => {
                // Check if data is empty
                if (!data || data.trim() === '') {
                    return '';  // Return an empty string if the data is empty
                }

                // Split the data into user IDs
                const userIds = data.split(',');

                // Create an array to hold the rendered tags
                const tags = userIds.map(userId => {
                    return `<span class="bg-blue-400 text-white py-1 px-2 rounded-lg mr-2">${userId}</span>`;
                });

                // Return the tags as a string
                return `<div style="text-align: left;"><small>${tags.join('')}</small></div>`;
            },
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
        setselectedTeams((prev) =>
            $(event.target).is(':checked') ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
        );
    };

    const handleRefresh = () => {
        fetchteams();
    };

    return (
        <div>
            <div className="my-3 flex justify-between w-2/3 mx-auto">
                <h1 className="text-2xl font-bold">Teams</h1>
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
                        Add Team
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="bg-gray-200 text-gray-500 py-1 px-2 rounded hover:bg-gray-300"
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white dtp-0 shadow-xl rounded border-t-2 border-blue-400 w-2/3 mx-auto' style={{ overflowX: 'auto', maxWidth: '100%', maxHeight: '25rem' }}>
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
                        message: `Are you sure you want to delete ${selectedTeams.length} setting(s)?`,
                    }}
                    isReversible={false}
                    onConfirm={onConfirmDelete}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <ToastContainer />
            <AnimatePresence>
                {isAddingTeam && (
                    <AddTeam
                        onClose={toggleAddSettingVisibility}
                        afterSave={handleRefresh}
                    />
                )}
                {isEditingTeam && selectedTeam && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <EditTeam
                            onClose={toggleEditSettingVisibility}
                            afterSave={handleRefresh}
                            teamId={selectedTeam.id}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageTeams;
