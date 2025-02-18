import React, { useEffect, useState, useRef } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import {  RefreshCw } from 'lucide-react';
import CustomLoader from '../../../components/CustomLoader';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const ManageProfile = () => {
    DataTable.use(DT);

    const [profiles, setProfiles] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setselectedTemplate] = useState(null);

    const [profileName, setProfileName] = useState('');
    const [websiteId, setWebsiteId] = useState('');
    const [websiteEmail, setWebsiteEmail] = useState('');
    const [signature, setSignature] = useState('');

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/api/getprofiles', {
                method: 'POST',
                body: JSON.stringify({ user_id: sessionStorage.getItem('id') })
            });

            const data = await response.json();
            if (!response.status) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setProfiles(data.profileData);
            setWebsites(data.websiteData);
        } catch (error) {
            console.error('Error fetching Email templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfileDetails = async (id) => {
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/api/getprofiledetails/`, {
                method: 'POST',
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();
    
            if (data.status) {
                setProfileName(data.profileInfo.profile_name || '');
                setWebsiteEmail(data.profileInfo.website_email || '');
                setWebsiteId(data.profileInfo.website || '');
                setSignature(data.profileInfo.signature || ''); 
            } else {
                toast.error(data.message || "Error fetching details");
            }
        } catch (error) {
            console.error('Error fetching template details:', error);
        }
    };
    



    const handleEditClick = (id) => {
        setselectedTemplate(id.id);
        fetchProfileDetails(id.id);
    };





    useEffect(() => {
        fetchProfiles();
    }, []);

    const columns = [
        {
            title: 'Sr No.',
            data: null,
            orderable: false,
            width : "50px",
            render: (data, type, row, meta) => {
                return `<div style="text-align: left;">${meta.row + 1}</div>`;
            },
        },
        {
            title: 'Profile Name',
            orderable: false,
            data: 'profile_name',
            // width: "200px",
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
            title: 'Website Email',
            orderable: false,
            data: 'website_email',
            width: "70px",
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },
        {
            title: 'Created Date',
            orderable: false,
            data: 'created_on',
            render: (data) => {
                return `<div style="text-align: left;">${data}</div>`;
            },
        },

        {
            title: 'Actions',
            data: null,
            orderable: false,
            width : "50px",
            render: (data, type, row) => `
            <div class="flex space-x-1">
        <button class="edit-btn mx-1 fsm" data-id="${row.id}">
            <img src="https://99crm.phdconsulting.in/public/images/edit.gif" alt="edit" class="h-4 w-auto" />
        </button>
        </div>
      `,
        },
    ];


    const handleRefresh = () => {
        fetchProfiles();
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let url = '';
            let method = '';
            let payload = {
                profile_id : selectedTemplate,
                profile_name: profileName,
                website_email :websiteEmail,
                website: websiteId,
                signature: signature,
                user_id : sessionStorage.getItem("id")
            };

            url = `https://99crm.phdconsulting.in/api/saveprofile`;
            method = 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });


            const data = await response.json();

            if (data.status) {
                
                if (selectedTemplate) {
                    toast.success('Profile updated successfully');
                } else {
                    toast.success('Profile added successfully');
                }
                fetchProfiles();
                setProfileName('');
                setWebsiteId('');
                setSignature('');
                setWebsiteEmail('')
                setselectedTemplate(null);
                
            } else {
                toast.error(data.message || 'Operation failed');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred while submitting the form');
        }
    };

    const clearTemplate = () => {
        setProfileName('');
        setWebsiteId('');
        setSignature('');
        setWebsiteEmail('')
        setselectedTemplate(null);
    }

    return (
        <div className='bg-gray-100 p-2'>
            <div className="my-3 flex justify-between ">
                <h1 className="text-md font-bold">Manage Profiles</h1>
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
                <div className='w-full flex space-x-2 items-start justify-evenly'>
                    <div className='bg-white shadow-xl px-2 w-[70%] rounded border-t-2 border-green-400'>
                        <DataTable
                            data={profiles}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                createdRow: (row, data) => {
                                    
                                    $(row).find('.edit-btn').on('click', (e) => handleEditClick(data));

                                },
                            }}
                        />
                    </div>
                    <div className="w-[30%] p-4 border-t-2 border-green-400 bg-white shadow-xl rounded add">
                        <h2 className="text-xl font-semibold mb-4">{(selectedTemplate && selectedTemplate != null) ? 'Edit Profile' : 'Add Profile'} </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Profile Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Website Name</label>
                                <select
                                    className="w-full p-2 border rounded select2"
                                    value={websiteId}
                                    onChange={(e) => setWebsiteId(e.target.value)}

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
                                <label className="block text-sm font-medium text-gray-700">Website Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded"
                                    value={websiteEmail}
                                    onChange={(e) => setWebsiteEmail(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Signature</label>

                                <ReactQuill
                                    value={signature}
                                    onChange={(content) => setSignature(content)}
                                    placeholder="Signature"
                                />
                            </div>
                            <div className='flex justify-end mt-4'>
                                {selectedTemplate && selectedTemplate !=null && (
                                    <button type="button" onClick={clearTemplate} className="bg-red-500 text-white py-1 px-2 rounded mr-2 flex items-center">
                                    Reset
                                </button>
                                )}
                                <button type="submit" className="bg-blue-500 text-white py-1 px-2 rounded flex items-center">
                                    {(selectedTemplate && selectedTemplate != null) ? 'Update Template' : 'Add template'}
                                </button></div>
                        </form>
                    </div>
                </div>
            )}



        </div>
    );
};

export default ManageProfile;
