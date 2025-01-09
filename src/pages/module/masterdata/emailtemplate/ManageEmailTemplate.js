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
import { Editor } from '@tinymce/tinymce-react';


const ManageEmailTemplate = () => {
    DataTable.use(DT);

    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setselectedTemplate] = useState(null);
    const [selectedTemplates, setselectedTemplates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [issingleModalOpen, setIssingleModalOpen] = useState(false);

    const [templateName, setTemplateName] = useState('');
    const [tagId, setTagId] = useState('');
    const [websiteId, setWebsiteId] = useState('');
    const [mailSubject, setMailSubject] = useState('');
    const [mailBody, setMailBody] = useState('');
    const [assignUsers, setAssignUsers] = useState([]);

    // State for dropdowns
    const [tags, setTags] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [users, setUsers] = useState([]);

    const selectAssignuserRef = useRef(null);


    const fetchTagsAndWebsitesAndUsers = async () => {
        try {
            const tagResponse = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/tags');
            const websiteResponse = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/websites');
            const userResponse = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getallusers');

            if (!tagResponse.ok || !websiteResponse.ok || !userResponse) {
                throw new Error('Failed to fetch tags or websites or users');
            }

            const tagData = await tagResponse.json();
            const websiteData = await websiteResponse.json();
            const userData = await userResponse.json();

            setTags(tagData.data);
            setWebsites(websiteData.data);
            setUsers(userData.data);
        } catch (error) {
            console.error('Error fetching tags or websites or users:', error);
        }
    };


    const fetchEmailTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getemailtemplates');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSettings(data.data);
        } catch (error) {
            console.error('Error fetching Email templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplateDetails = async (id) => {
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/getemailtemplate/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTemplateName(data.data.template_name);
            setTagId(data.data.tag_name);
            setWebsiteId(data.data.website_id);
            setMailSubject(data.data.mail_subject);
            setMailBody(data.data.mail_body);
            const assignUserString = data.data.assign_user || ''; 
            const assignedUserIds = assignUserString.split(',').map(id => id.trim()); 
            setAssignUsers(assignedUserIds);

          
            if (selectAssignuserRef.current) {
                $(selectAssignuserRef.current).val(assignedUserIds).trigger('change'); 
            }
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
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/deleteemailtemps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedTemplates }),
            });


            if (!response.ok) {
                throw new Error('Failed to delete Email templates');
            }

            const data = await response.json();

            setSettings(settings.filter((setting) => !selectedTemplates.includes(setting.id)));
            toast.success('Email templates deleted successfully!');
            setTimeout(() => {
                fetchEmailTemplates();
            }, 1000)

        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting Email templates.');
        } finally {

            setIsModalOpen(false);
            setselectedTemplates([]);


            document.querySelectorAll(".checkbox").forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
    };


    const handleSingleDeleteClick = (id)=>{
        setselectedTemplate(id);
        setIssingleModalOpen(true);
    }
    const onConfirmSingleDelete = async () => {
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/deleteemailtemplate/${selectedTemplate}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete the email template');
            }
    
            const data = await response.json();
    
            if (data.status) {
                toast.success('Email template deleted successfully!');
                setTimeout(() => {
                    fetchEmailTemplates(); // Refresh the template list
                }, 1000);
    
                // Clear the selected template after deletion
                setselectedTemplate(null);
            } else {
                toast.error(data.message || 'Failed to delete the email template');
            }
        } catch (error) {
            console.error('Error deleting email template:', error);
            toast.error('An error occurred while deleting the email template.');
        } finally {
            setIssingleModalOpen(false); // Close the modal
        }
    };


    useEffect(() => {
        fetchEmailTemplates();
        fetchTagsAndWebsitesAndUsers();
    }, []);
    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectAssignuserRef.current).select2({
            placeholder: "Select assign users",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            console.log("Selected users:", selectedValues);
            //setAssugnusers
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectAssignuserRef.current) {
                //$(selectAssignuserRef.current).select2('destroy');
            }
        };
    }, [users]);

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
            title: 'Category',
            orderable: false,
            data: 'category',
            width: "50px",
            render: (data) => {
                return `<div style="text-align: left;width:50px;">${data}</div>`;
            },
        },
        {
            title: 'Template Name',
            orderable: false,
            data: 'template_name',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Website',
            orderable: false,
            data: 'website',
            width: "70px",
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Assign User',
            data: 'assigned_users',
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
                    return `<span class="bg-yellow-500 text-white py-1 px-1 rounded-lg" style="font-size:11px">${userId}</span>`;
                });

                // Return the tags as a string
                return `<div style="text-align: left;font-size:11px;">${tags.join('')}</div>`;
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
        fetchEmailTemplates();
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let url = '';
            let method = '';
            let payload = {
                template_name: templateName,
                tag_id: tagId,
                website_id: websiteId,
                mail_subject: mailSubject,
                mail_body: mailBody,
                assign_user: assignUsers.join(','), // convert array to string
            };

            if (selectedTemplate) {
                // Edit existing template
                url = `https://99crm.phdconsulting.in/99crmwebapi/api/updateemailtemplate/${selectedTemplate}`;
                method = 'PUT';
            } else {
                // Add new template
                url = `https://99crm.phdconsulting.in/99crmwebapi/api/addemailtemplate`;
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
                    toast.success('Email template updated successfully');
                } else {
                    toast.success('Email template added successfully');
                }
                fetchEmailTemplates(); 
                setTemplateName('');
                setTagId('');
                setWebsiteId('');
                setMailSubject('');
                setMailBody('');
                setAssignUsers([]);
                setselectedTemplate(null);
                if (selectAssignuserRef.current) {
                    $(selectAssignuserRef.current).val(null).trigger('change');
                }
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
                <h1 className="text-2xl font-bold">Email Templates</h1>
                <div className='flex '>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-2 flex items-center"
                    >
                        <Trash2 className="mr-3" />
                        Delete
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
                <div className='w-full flex space-x-2 items-start justify-evenly'>
                    <div className='bg-white shadow-xl px-2 w-[70%] rounded border-t-2 border-blue-400'>
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
                    <div className="w-[30%] p-4 border-t-2 border-blue-400 bg-white shadow-xl rounded">
                        <h2 className="text-xl font-semibold mb-4">{(selectedTemplate && selectedTemplate != null) ? 'Edit Template' : 'Add template'} </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Template Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Tag</label>
                                <select
                                    className="w-full p-2 border rounded select2"
                                    value={tagId}
                                    onChange={(e) => setTagId(e.target.value)}
                                    
                                >
                                    <option value="">Select Tag</option>
                                    {tags.map(tag => (
                                        <option key={tag.id} value={tag.id}>
                                            {tag.tag_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Website</label>
                                <select
                                    className="w-full p-2 border rounded select2"
                                    value={websiteId}
                                    onChange={(e) => setWebsiteId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Website</option>
                                    {websites.map(website => (
                                        <option key={website.id} value={website.id}>
                                            {website.website}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Mail Subject</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={mailSubject}
                                    onChange={(e) => setMailSubject(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Mail Body</label>

                                <Editor
                                    apiKey="2crkajrj0p3qpzebc7qfndt5c6xoy8vwer3qt5hsqqyv8hb8" // Your TinyMCE API Key
                                    value={mailBody}
                                    init={{
                                        height: 350,
                                        menubar: false,
                                        plugins: ['advlist autolink lists link charmap print preview anchor'],
                                        toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
                                        placeholder: 'Signature',
                                    }}
                                    onEditorChange={(content) => setMailBody(content)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Assign Users</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    multiple
                                    value={assignUsers}
                                    ref={selectAssignuserRef}
                                >
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                               {(selectedTemplate && selectedTemplate != null) ? 'Update Template' : 'Add template'}
                            </button>
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
            <ToastContainer />

        </div>
    );
};

export default ManageEmailTemplate;
