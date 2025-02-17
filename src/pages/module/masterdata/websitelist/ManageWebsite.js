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
import EditWebsite from './EditWebsite';

const ManageWebsite = () => {
    DataTable.use(DT);

    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWebsite, setSelectedWebsite] = useState(null);
    const [issingleModalOpen, setIssingleModalOpen] = useState(false);
    const [isEditingTemplate, setisEditingTemplate] = useState(false);

    const tableRef = useRef(null);


    const toggleEditSettingVisibility = () => {
        setisEditingTemplate(!isEditingTemplate);
    };

    const fetchWebsites = async () => {
        try {
            setLoading(true);
            const cachedWebsites = sessionStorage.getItem('cachedWebsites');
            if (cachedWebsites) {
                // Use cached data
                setWebsites(JSON.parse(cachedWebsites));
                setLoading(false);
                return;
            }
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/phdwebsites');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            sessionStorage.setItem('cachedWebsites', JSON.stringify(data.data));
            setWebsites(data.data);
        } catch (error) {
            console.error('Error fetching websites:', error);
        } finally {
            setLoading(false);
        }
    };





    const handleEditButtonClick = (template) => {
        setSelectedWebsite(template);
        setisEditingTemplate(true);
    };

    useEffect(() => {
        fetchWebsites();
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
            title: 'Website Name',
            orderable: false,
            data: 'website',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Display Name',
            orderable: false,
            data: 'display_name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Company Name',
            orderable: false,
            data: 'company_name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Color',
            orderable: false,
            data: 'color_code',
            render: (data) => {
                return `<span style="background-color: ${data}; text-align: left;" class="px-2 py-1 rounded">${data}</span>`;
            },
        },
        {
            title: 'Phd Planner',
            orderable: false,
            data: 'checkPhdPlanner',
            render: (data) => {
                return `<div style="text-align: left;">${data == 1 ? 'Yes' : 'No'}</div>`;
            },
        },
        {
            title: 'Currency/Payment',
            orderable: false,
            data: 'paymentData',
            render: (data) => {
                // Parse the JSON string from the database
                let paymentData = [];
                try {
                    paymentData = JSON.parse(data); // Parse the stored JSON string into an array
                } catch (error) {
                    console.error('Error parsing payment data:', error);
                }

                // Generate the list items from the parsed data
                const listItems = paymentData.map(item =>
                    `<li class="text-sm text-gray-600">
                        ${item.currency_type} - ${item.payment_url}
                    </li>`
                ).join('');

                // Return the formatted list inside a <ul>
                return `<ul class="list-disc pl-2 py-3">${listItems}</ul>`;
            },
        },
        {
            title: 'Action',
            data: null,
            orderable: false,
            render: (data, type, row) => `
                <button class="edit-btn btn btn-sm mx-1" data-id="${row.id}">
                    <img src="https://99crm.phdconsulting.in/public/images/edit.gif" class="h-4 w-auto" alt="edit" />
                </button>
            `,
        },
    ];



    const handleRefresh = () => {
        sessionStorage.removeItem('cachedWebsites');
        fetchWebsites();
    };
    const handleSingleDeleteClick = (id) => {
        setSelectedWebsite(id);
        setIssingleModalOpen(true);
    }
    const onConfirmSingleDelete = async () => {
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/deletequotetemplate/${selectedWebsite}`, {
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
            setSelectedWebsite(null);

        } catch (error) {
            console.error('Error deleting quote template:', error);
            toast.error('An error occurred while deleting the quote template.');
        } finally {
            setIssingleModalOpen(false); // Close the modal
        }
    };

    return (
        <div>
            
            <div className="my-3 flex justify-between">
                <h1 className="text-2xl font-bold">Websites</h1>
                <div className='flex mdbut'>

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
                <div className='bg-white dtp-0 shadow-xl rounded border-t-2 border-blue-400'>
                    <DataTable
                        data={websites}
                        columns={columns}
                        options={{
                            pageLength: 50,
                            lengthMenu: [
                                [50, 200, 500, 1000], // Number of rows options
                                ['50', '200', '500', '1000'], // Labels for the options
                            ],
                            createdRow: (row, data) => {
                                $(row).find('.edit-btn').on('click', () => handleEditButtonClick(data));
                                //$(row).find('.delete-btn').on('click', (e) => handleSingleDeleteClick(data.id));
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


                {isEditingTemplate && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <EditWebsite
                            onClose={toggleEditSettingVisibility}
                            afterSave={handleRefresh}
                            websiteId={selectedWebsite}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageWebsite;
