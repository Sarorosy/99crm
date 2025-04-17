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
import AddBoxTag from './AddBoxTag';
import EditBoxTag from './EditBoxTag';

const ManageBoxTags = () => {
    DataTable.use(DT);

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSetting, setSelectedSetting] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
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

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/getallboxtags');

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
            const response = await fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/deleteboxtag', {
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
                fetchTags();
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


    const handleEditButtonClick = (setting) => {
        setSelectedSetting(setting);
        setIsEditingSetting(true);
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
            title: 'Tag Name',
            orderable: false,
            data: 'box_tag_name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
        <button class="edit-btn btn btn-sm mx-1" data-id="${row.id}">
            <img src="https://99crm.phdconsulting.in/zend/public/images/edit.gif" alt="edit" />
        </button>
      `,
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
            <div className="my-3 flex justify-between w-2/3 mx-auto">
                <h1 className="text-md font-bold">Box Tags</h1>
                <div className='flex mdbut'>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-3 flex items-center"
                    >
                        <Trash2 className="mr-2" size={12}/>
                        Delete
                    </button>
                    <button
                        onClick={toggleAddSettingVisibility}
                        className="btn btn-success text-white py-1 px-2 rounded flex items-center mr-3"
                    >
                        <PlusCircle className="mr-2" size={12}/>
                        Add Box Tag
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="text-gray-500 py-1 px-1 rounded hover:bg-gray-300"
                    >
                        <RefreshCw size={15}/>
                    </button>
                </div>
            </div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white dtp-0 shadow-xl border-t-2 border-green-400 rounded w-2/3 mx-auto'>
                <DataTable
                    data={tags}
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
                        message: `Are you sure you want to delete ${selectedTags.length} setting(s)?`,
                    }}
                    onConfirm={onConfirmDelete}
                    isReversible={false}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            
            <AnimatePresence>
                {isAddingSetting && (

                    <AddBoxTag
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
                        <EditBoxTag
                            onClose={toggleEditSettingVisibility}
                            afterSave={handleRefresh}
                            tagId={selectedSetting}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageBoxTags;
