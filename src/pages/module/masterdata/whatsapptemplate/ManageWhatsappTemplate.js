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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const ManageWhatsappTemplate = () => {
    DataTable.use(DT);

    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setselectedTemplate] = useState(null);
    const [selectedTemplates, setselectedTemplates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [issingleModalOpen, setIssingleModalOpen] = useState(false);

    const [templateName, setTemplateName] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [templateSlug, setTemplateSlug] = useState('');
    const [description, setDescription] = useState('');


    // State for dropdowns
    const [companies, setCompanies] = useState([]);


    const selectAssignuserRef = useRef(null);


    const fetchCompanies = async () => {
        try {
            const companyResponse = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/companies');


            if (!companyResponse.ok) {
                throw new Error('Failed to fetch companies or websites or users');
            }

            const tagData = await companyResponse.json();

            setCompanies(tagData.data);
        } catch (error) {
            console.error('Error fetching companies or websites or users:', error);
        }
    };


    const fetchWhatsappTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getwhatsapptemplates');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSettings(data.data);
        } catch (error) {
            console.error('Error fetching whatsapp templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplateDetails = async (id) => {
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/getwhatsapptemplate/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTemplateName(data.data.template_name);
            setCompanyId(data.data.company_id);
            setTemplateSlug(data.data.template_slug);
            setDescription(data.data.description);


        } catch (error) {
            console.error('Error fetching template details:', error);
        }
    };


    const handleCopyClick = (id) => {
        setselectedTemplate(null);
        fetchTemplateDetails(id);
    };

    const handleEditClick = (id) => {
        setselectedTemplate(id);
        fetchTemplateDetails(id);
    };


    const handleDelete = () => {
        if (selectedTemplates.length === 0) {
            toast.error("Please select at least one to delete.");
            return;
        }
        setIsModalOpen(true);
    };

    const onConfirmDelete = async () => {
        try {
            // Constructing the request body with the selected settings IDs
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/deletewhatsapptemps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedTemplates }),
            });


            if (!response.ok) {
                throw new Error('Failed to delete whatsapp templates');
            }

            const data = await response.json();

            setSettings(settings.filter((setting) => !selectedTemplates.includes(setting.id)));
            toast.success('whatsapp templates deleted successfully!');
            setTimeout(() => {
                fetchWhatsappTemplates();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting whatsapp templates.');
        } finally {

            setIsModalOpen(false);
            setselectedTemplates([]);


            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };


    const handleSingleDeleteClick = (id) => {
        setselectedTemplate(id);
        setIssingleModalOpen(true);
    }
    const onConfirmSingleDelete = async () => {
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/deletewhatsapptemplate/${selectedTemplate}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete the whatsapp template');
            }

            const data = await response.json();

            if (data.status) {
                toast.success('whatsapp template deleted successfully!');
                setTimeout(() => {
                    fetchWhatsappTemplates(); // Refresh the template list
                }, 1000);

                // Clear the selected template after deletion
                setselectedTemplate(null);
            } else {
                toast.error(data.message || 'Failed to delete the whatsapp template');
            }
        } catch (error) {
            console.error('Error deleting whatsapp template:', error);
            toast.error('An error occurred while deleting the whatsapp template.');
        } finally {
            setIssingleModalOpen(false); // Close the modal
        }
    };


    useEffect(() => {
        fetchWhatsappTemplates();
        fetchCompanies();
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
            // title: 'Template Name',
            title: 'Name',
            orderable: false,
            data: 'template_name',
            width: "50px",
            render: (data) => {
                return `<div style="text-align: left;width:50px;">${data}</div>`;
            },
        },
        {
            title: 'Slug',
            orderable: false,
            width: "70px",
            data: 'template_slug',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Company',
            orderable: false,
            data: 'company',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },

        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
            <div class="flex space-x-1">
            <button class="copy-btn btn btn-sm mx-1" data-id="${row.id}">
            <i class="far fa-clone hover:text-blue-400"></i>
        </button>
        <button class="edit-btn btn btn-sm mx-1" data-id="${row.id}">
            <img src="https://99crm.phdconsulting.in/public/images/edit.gif" alt="edit" class="h-4 w-auto" />
        </button>
        <button class="delete-btn btn btn-sm mx-1" data-id="${row.id}">
            <img src="https://99crm.phdconsulting.in/public/images/0.png" alt="edit" class="h-4 w-auto" />
        </button>
        </div>
      `,
        },
    ];


    const handleCheckboxClick = (event) => {
        const id = $(event.target).data('id');
        setselectedTemplates((prev) =>
            $(event.target).is(':checked') ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
        );
    };

    const handleRefresh = () => {
        fetchWhatsappTemplates();
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let url = '';
            let method = '';
            let payload = {
                template_name: templateName,
                company_id: companyId,
                template_slug: templateSlug,
                description: description,

            };

            if (selectedTemplate) {
                // Edit existing template
                url = `https://99crm.phdconsulting.in/99crmwebapi/api/updatewhatsapptemplate/${selectedTemplate}`;
                method = 'PUT';
            } else {
                // Add new template
                url = `https://99crm.phdconsulting.in/99crmwebapi/api/addwhatsapptemplate`;
                method = 'POST';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status) {
                if (selectedTemplate) {
                    toast.success('whatsapp template updated successfully');
                } else {
                    toast.success('whatsapp template added successfully');
                }
                fetchWhatsappTemplates();
                setTemplateName('');
                setCompanyId('');
                setTemplateSlug('');
                setDescription('');
                setselectedTemplate(null);

            } else {
                toast.error(data.message || 'Operation failed');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred while submitting the form');
        }
    };

    return (
        <div className='bg-gray-100 p-2'>
            <div className="my-3 flex justify-between ">
                <h1 className="text-md font-bold">Whatsapp Templates</h1>
                <div className='flex mdbut'>
                    <button
                        onClick={handleDelete}
                        className=" bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-3 flex items-center"
                    >
                        <Trash2 className="mr-2" size={12} />
                        Delete
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
                <div className='w-full flex space-x-2 items-start justify-evenly'>
                    <div className='bg-white shadow-xl px-3 w-[70%] rounded border-t-2 border-green-400'>
                        <DataTable
                            data={settings}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                createdRow: (row, data) => {
                                    $(row).find('.checkbox').on('click', handleCheckboxClick);
                                    $(row).find('.copy-btn').on('click', (e) => handleCopyClick(data.id));
                                    $(row).find('.edit-btn').on('click', (e) => handleEditClick(data.id));
                                    $(row).find('.delete-btn').on('click', (e) => handleSingleDeleteClick(data.id));
                                },
                            }}
                        />
                    </div>
                    <div className="w-[30%] p-4 border-t-2 border-green-400 bg-white shadow-xl rounded add">
                        <h2 className="text-xl font-semibold mb-4">{(selectedTemplate && selectedTemplate != null) ? 'Edit Template' : 'Add Template'} </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Template Name</label>
                                {/* <label className="block text-sm font-medium text-gray-700">Template Name</label> */}
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Template Slug</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={templateSlug}
                                    onChange={(e) => setTemplateSlug(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Company</label>
                                <select
                                    className="w-full p-2 border rounded select2"
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}

                                >
                                    <option value="">Select Company</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.id}>
                                            {company.company_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Description</label>

                                <ReactQuill
                                    value={description}
                                    onChange={setDescription}
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline'],
                                            [{ align: [] }],
                                            [{ list: 'ordered' }, { list: 'bullet' }],
                                            ['link'],
                                            ['clean']
                                        ],
                                    }}
                                    placeholder="Signature"
                                />
                            </div>

                            <div className='text-end'>
                                <button type="submit" className="bg-blue-500 text-white py-1 px-2 rounded">
                                    {(selectedTemplate && selectedTemplate != null) ? 'Update Template' : 'Add template'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <ConfirmationModal
                    context={{
                        title: 'Confirm Deletion',
                        message: `Are you sure you want to delete ${selectedTemplates.length} template(s)?`,
                    }}
                    isReversible={false}
                    onConfirm={onConfirmDelete}
                    onClose={() => setIsModalOpen(false)}
                />
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


        </div>
    );
};

export default ManageWhatsappTemplate;
