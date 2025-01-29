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
import AddQuoteTemplate from './AddQuoteTemplate';
import EditQuoteTemplate from './EditQuoteTemplate';

const ManageQuoteTemplate = () => {
    DataTable.use(DT);

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [issingleModalOpen, setIssingleModalOpen] = useState(false);
    const [selectedTeams, setselectedTeams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingTemplate, setisAddingTemplate] = useState(false);
    const [isEditingTemplate, setisEditingTemplate] = useState(false);

    const tableRef = useRef(null);

    const toggleAddSettingVisibility = () => {
        setisAddingTemplate(!isAddingTemplate);
    };
    const toggleEditSettingVisibility = () => {
        setisEditingTemplate(!isEditingTemplate);
    };

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const cachedTemplates = sessionStorage.getItem('quoteTemplates');
            if (cachedTemplates) {
                // Use cached data
                setTemplates(JSON.parse(cachedTemplates));
                setLoading(false);
                return;
            }
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getquotetemplates');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            sessionStorage.setItem('quoteTemplates', JSON.stringify(data.data));
            setTemplates(data.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };





    const handleEditButtonClick = (template) => {
        setSelectedTemplate(template);
        setisEditingTemplate(true);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const columns = [
        {
            title: 'Sr No.',
            data: null,
            orderable: false,
            render: (data, type, row, meta) => {
                return `<div style="text-align: left;">${meta.row + 1}</div>`;
            },
        },
        {
            title: 'Service Name',
            orderable: false,
            data: 'quote_service_name',
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
            title: 'Created Date',
            data: 'created_date',
            render: (data) => {
                if (!data) return ''; // Handle cases where data might be null or undefined
                const date = new Date(data * 1000); // Assuming the timestamp is in seconds
                const options = { day: '2-digit', month: 'short', year: 'numeric' };
                return date.toLocaleDateString('en-US', options); // Format: 14 Nov 2024
            },
        },

        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
        <button class="edit-btn btn btn-sm mx-1" data-id="${row.id}">
            <img src="https://99crm.phdconsulting.in/public/images/edit.gif" class="h-4 w-auto" alt="edit" />
        </button>
        <button class="delete-btn btn btn-sm mx-1" data-id="${row.id}">
            <img src="https://99crm.phdconsulting.in/public/images/0.png" alt="edit" class="h-4 w-auto" />
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
        sessionStorage.removeItem('quoteTemplates');
        fetchTemplates();
    };
    const handleSingleDeleteClick = (id) => {
        setSelectedTemplate(id);
        setIssingleModalOpen(true);
    }
    const onConfirmSingleDelete = async () => {
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/deletequotetemplate/${selectedTemplate}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete the email template');
            }

            const data = await response.json();


            toast.success('Quote template deleted successfully!');
            setTimeout(() => {
                handleRefresh(); // Refresh the template list
            }, 1000);

            // Clear the selected template after deletion
            setSelectedTemplate(null);

        } catch (error) {
            console.error('Error deleting quote template:', error);
            toast.error('An error occurred while deleting the quote template.');
        } finally {
            setIssingleModalOpen(false); // Close the modal
        }
    };

    return (
        <div>
            <ToastContainer />
            <div className="my-3 flex justify-between">
                <h1 className="text-2xl font-bold">Quote Templates</h1>
                <div className='flex mdbut'>

                    <button
                        onClick={toggleAddSettingVisibility}
                        className="btn btn-success text-white py-1 px-2 rounded flex items-center mr-2"
                    >
                        <PlusCircle className="mr-2" size={12} />
                        Add Template
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
                <div className='bg-white dtp-0 reportpage shadow-xl rounded border-t-2 border-blue-400'>
                    <DataTable
                        data={templates}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            lengthMenu: [
                                [50, 200, 500, 1000], // Number of rows options
                                ['50', '200', '500', '1000'], // Labels for the options
                            ],
                            createdRow: (row, data) => {
                                $(row).find('.edit-btn').on('click', () => handleEditButtonClick(data));
                                $(row).find('.delete-btn').on('click', (e) => handleSingleDeleteClick(data.id));
                            },
                        }}
                    />
                </div>
            )}
            {issingleModalOpen && (
                <ConfirmationModal
                    context={{
                        title: 'Confirm Deletion',
                        message: `Are you sure you want to delete template?`,
                    }}
                    isReversible={false}
                    onConfirm={onConfirmSingleDelete}
                    onClose={() => setIssingleModalOpen(false)}
                />
            )}

            <AnimatePresence>
                {isAddingTemplate && (

                    <AddQuoteTemplate
                        onClose={toggleAddSettingVisibility}
                        afterSave={handleRefresh}
                        templateId={selectedTemplate}
                    />

                )}

                {isEditingTemplate && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <EditQuoteTemplate
                            onClose={toggleEditSettingVisibility}
                            afterSave={handleRefresh}
                            templateId={selectedTemplate}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageQuoteTemplate;
