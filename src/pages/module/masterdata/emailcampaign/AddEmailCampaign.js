import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';
import axios from 'axios'; // Import axios for API requests
import $ from 'jquery';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';


const AddEmailCampaign = ({ onClose, afterSave, campaignId }) => {
    const [camptitle, setCampTitle] = useState(campaignId ? campaignId.camp_title : "");
    const [campType, setCampType] = useState('');
    const [assignType, setAssignType] = useState('');
    const [allocatedTo, setAllocatedTo] = useState('');
    const [allocatedUsers, setAllocatedUsers] = useState([]);
    const [selectLimit, setSelectLimit] = useState('100');
    const [posting, setPosting] = useState(false);
    const [websites, setWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const [selectedProfile, setSelectedProfile] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [allStatus, setAllStatus] = useState([]);
    const [status, setStatus] = useState([]);
    const [mailBody, setMailBody] = useState(campaignId ? campaignId.email_body : "");
    const formRef = useRef(null);

    const [filterDate, setFilterDate] = useState('');
    const [startDate, setStartDate] = useState(null); // Store start date
    const [endDate, setEndDate] = useState(null); // Store end date

    const selectWebsiteRef = useRef(null);
    const selectProfileref = useRef(null);

    const websiteRef = useRef(null);
    const statusRef = useRef(null);
    const allocatedUserRef = useRef(null);
    const [searching, setSearching] = useState(false);
    const [searchedQueries, setSearchedQueries] = useState([]);

    const [selectedIds, setSelectedIds] = useState([]);
    const [signatures, setSignatures] = useState({});
    const [selectAll, setSelectAll] = useState(false);

    const handleCheckAll = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        let ids = isChecked ? searchedQueries.slice(0, 200).map((q) => q.assign_id) : [];
        setSelectedIds(ids);
    };

    const handleCheckboxChange = (assignId) => {
        setSelectedIds((prev) => {
            let updated = prev.includes(assignId)
                ? prev.filter((id) => id !== assignId)
                : prev.length < 200
                    ? [...prev, assignId]
                    : prev;
            return updated;
        });
    };

    useEffect(() => {
        let collected = selectedIds.reduce((acc, id) => {
            const q = searchedQueries.find((q) => q.assign_id === id);
            if (q) acc[id] = q.signature;
            return acc;
        }, {});
        setSignatures(collected);
    }, [selectedIds, searchedQueries]);

    const formattedAssignIds = selectedIds
        .map((id) => {
            const q = searchedQueries.find((q) => q.assign_id === id);
            return q
                ? `${q.assign_id}||${q.id}||${q.user_id}||${q.update_status}||${q.name}||${q.email_id}||${q.website_email}`
                : '';
        })
        .filter(Boolean)
        .join('~');

    const formattedSignatures = Object.values(signatures).reverse().join('|||');



    useEffect(() => {
        // Initialize select2 for Select Team
        $(allocatedUserRef.current).select2({
            placeholder: "Select Assign User",
            allowClear: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setAllocatedTo(selectedValues);
            fetchProfiles('', selectedValues);
        });


        return () => {
            if (allocatedUserRef.current) {
                //$(tagsRef.current).select2('destroy');
            }
        };
    }, [allocatedUsers]);

    useEffect(() => {
        // Calculate dynamic date range (last 1 month)
        const start = moment().subtract(1, 'month'); // 1 month ago
        const end = moment(); // Today

        setStartDate(start);
        setEndDate(end);

        // Initialize the date range picker with the dynamic date range
        $('#filterDate').daterangepicker(
            {
                locale: {
                    format: 'MM/DD/YYYY',
                },
                startDate: start,
                endDate: end,
            },
            function (start, end, label) {
                setFilterDate(start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY'));
                setStartDate(start);  // Update state with selected start date
                setEndDate(end);      // Update state with selected end date

            }
        );
    }, []);

    useEffect(() => {
        fetchWebsites();
        fetchStatus();
    }, []);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(statusRef.current).select2({
            placeholder: "Select Status",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setStatus(selectedValues);
        });


        return () => {
            if (statusRef.current) {
                //$(tagsRef.current).select2('destroy');
            }
        };
    }, [allStatus]);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectProfileref.current).select2({
            placeholder: "Select Profiles",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            setSelectedProfile(selectedValues);
        });


        return () => {
            if (selectProfileref.current) {
                //$(selectProfileref.current).select2('destroy');
            }
        };
    }, [profiles]);

    // Fetch websites from the API
    const fetchWebsites = async () => {
        try {
            const response = await axios.get('https://99crm.phdconsulting.in/zend/99crmwebapi/api/websites');
            setWebsites(response.data.data); // Assuming response.data is the list of websites
        } catch (error) {
            console.error('Error fetching websites', error);
        }
    };

    // Fetch status from the API
    const fetchStatus = async () => {
        try {
            const response = await axios.get('https://99crm.phdconsulting.in/zend/api/getallstatus');
            setAllStatus(response.data.data); // Assuming response.data is the list of websites
        } catch (error) {
            console.error('Error fetching websites', error);
        }
    };

    //Fetch profiles based on selected website
    const fetchProfiles = async (websiteId, userId) => {

        try {
            const response = await axios.post('https://99crm.phdconsulting.in/zend/api/getuserprofiles',
                {
                    website: websiteId,
                    user_id: userId
                });
            if (response.data.status) {
                setProfiles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching profiles', error);
        }
    };


    const fetchWebsiteProfiles = async (websiteId) => {
        if (!websiteId) return;

        try {
            const response = await axios.post('https://99crm.phdconsulting.in/zend/99crmwebapi/api/getuserprofilewebsite', { website_id: websiteId });
            setProfiles(response.data.data);
        } catch (error) {
            console.error('Error fetching profiles', error);
        }
    };


    const handleWebsiteChange = (e) => {
        const websiteId = e.target.value;
        setSelectedWebsite(websiteId);
        fetchWebsiteProfiles(websiteId);
    };

    useEffect(() => {
        // Initialize select2 for the website dropdown
        $(selectWebsiteRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
        }).on('change', handleWebsiteChange);

        return () => {
            // Cleanup when the component unmounts
            if (selectWebsiteRef.current) {
                $(selectWebsiteRef.current).select2('destroy');
            }
        };
    }, [websites]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);
        if (!campType) {
            toast.error('Camp Type is required')
            setPosting(false);
            return;
        }

        if (!camptitle) {
            toast.error('Campaign title is required')
            setPosting(false);
            return;
        };
        if (campType == "Website Camp" && !selectedWebsite) {
            toast.error('Website is required')
            setPosting(false);
            return;
        };
        if (campType == "User Camp" && !allocatedTo) {
            toast.error('Please select a User')
            setPosting(false);
            return;
        };
        if (!mailBody) {
            toast.error('Email body is required')
            setPosting(false);
            return;
        };
        if (!selectedProfile) {
            toast.error('Profile is required')
            setPosting(false);
            return;
        };
        if (!status) {
            toast.error('Status is required')
            setPosting(false);
            return;
        };

        try {
            // POST request to the API
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/addemailcampaign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // Set Content-Type to application/json
                },
                body: JSON.stringify({
                    camp_title: camptitle,
                    camp_type: campType,
                    assignType: assignType,
                    allocated_to: allocatedTo,
                    select_limit: selectLimit,
                    camp_website: selectedWebsite,
                    website: selectedWebsite, // Use selectedWebsite value
                    profile_id: selectedProfile,
                    filterDate: `${startDate.format('YYYY-MM-DD')} - ${endDate.format('YYYY-MM-DD')}`,
                    update_status: status,
                    camp_website: selectedWebsite, // Use selectedWebsite value
                    email_body: mailBody, // Ensure you are sending a valid email body
                    assign_id: formattedAssignIds,
                    signatures: formattedSignatures 
                }),
            });


            const data = await response.json();

            if (data.status) {
                console.log('Success:', data);
                formRef.current.reset();
                toast.success('Campaign added successfully');
                setTimeout(() => {
                    onClose();
                    afterSave();
                }, 1500);
            } else {
                console.error('Error:', data);
                toast.error(data.message || 'Error occurred while creating the campaign');
            }
        } catch (error) {
            console.error('Error during API call:', error);
            toast.error('Error occurred while creating the campaign');
        } finally {
            setPosting(false);
        }
    };

    const handleAssignType = async (e) => {
        const assignType = e.target.value;
        setAssignType(assignType);
        setAssignType(assignType);

        try {
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/specificuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assignType: assignType,
                }),
            });
            const data = await response.json();
            if (data.status) {
                setAllocatedUsers(data.data);
            }
        } catch (error) {
            console.error('Error during API call:', error);
        }
    }

    const handleSearch = async (e) => {
        try {
            setSearching(true);
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/campaignloaduserquery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    camp_title: camptitle,
                    camp_type: campType,
                    assignType: assignType,
                    allocated_to: allocatedTo,
                    select_limit: selectLimit,
                    camp_website: selectedWebsite,
                    website: selectedWebsite, // Use selectedWebsite value
                    profile_id: selectedProfile,
                    filterDate: `${startDate.format('YYYY-MM-DD')} - ${endDate.format('YYYY-MM-DD')}`,
                    update_status: status,
                    camp_website: selectedWebsite, // Use selectedWebsite value
                    email_body: mailBody,
                    user_id: sessionStorage.getItem("id"),
                    user_name: sessionStorage.getItem("name"),
                    team_id: sessionStorage.getItem("team_id"),

                }),
            });
            const data = await response.json();
            // if (data.status) {
            //     console.log(data.QueryUsers);
            // }
            if (data.status) {
                setSearchedQueries(data.QueryUsers);
            }
            console.log('Success:', response);
        } catch (e) {
            console.error('Error during API call:', e);
        } finally {
            setSearching(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >

            <h2 className="text-md font-bold mb-3 text-center">Add Email Campaign</h2>
            <button
                onClick={onClose}
                className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
            >
                <CircleX size={32} />
            </button>

            <div className='col-md-10 cent add qhpage'>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-4 border-t-2 rounded border-green-400  mx-auto bg-white shadow-xl">

                    <div className='d-flex'>
                        {/* Email Campaign Subject */}
                        <div className='col-md-12'>
                            <label htmlFor="camp_title" className="block text-gray-700 font-medium mb-2">
                                Email Campaign Subject
                            </label>
                            <input
                                type="text"
                                id="camp_title"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={camptitle}
                                onChange={(e) => setCampTitle(e.target.value)}

                            />
                        </div>


                    </div>

                    <div className='d-flex row '>
                        <div className='col-md-3'>
                            <label htmlFor="camp_type" className="block text-gray-700 font-medium mb-2">
                                Camp Type
                            </label>
                            <select
                                id="camp_type"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

                                value={campType}
                                onChange={(e) => setCampType(e.target.value)}
                            >
                                <option value="">Select Camp Type</option>
                                <option value="Website Camp">Website Camp</option>
                                <option value="User Camp">User Camp</option>
                            </select>
                        </div>
                        <div className='col-md-3' style={{ display: campType === 'User Camp' ? 'block' : 'none' }}>
                            <label htmlFor="assignType" className="block text-gray-700 font-medium mb-2">
                                Assign Type
                            </label>
                            <select
                                id="assignType"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

                                value={assignType}
                                onChange={handleAssignType}
                            >
                                <option value="">Select Assign Type</option>
                                <option value="opsuser">OPS USER</option>
                                <option value="crmuser">CRM USER</option>
                            </select>
                        </div>
                        <div className='col-md-3' style={{ display: campType === 'User Camp' ? 'block' : 'none' }}>
                            <label htmlFor="allocated_to" className="block text-gray-700 font-medium mb-2">
                                Assign User
                            </label>
                            <select
                                id="allocated_to"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                ref={allocatedUserRef}
                                value={assignType}

                            >
                                <option value="">Select Assign User</option>
                                {allocatedUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='col-md-3' >
                            <label htmlFor="select_limit" className="block text-gray-700 font-medium mb-2">
                                Select Limit
                            </label>
                            <select
                                id="select_limit"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

                                value={selectLimit}
                                onChange={(e) => setSelectLimit(e.target.value)}
                            >
                                <option value="100">100</option>
                                <option value="200">200</option>
                            </select>
                        </div>


                        <div className='col-md-3' style={{ display: campType === 'Website Camp' ? 'block' : 'none' }}>
                            <label htmlFor="website" className="block text-gray-700 font-medium mb-2">
                                Website
                            </label>
                            <select
                                id="website"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"

                                ref={selectWebsiteRef}
                                value={selectedWebsite}
                            >
                                <option value="">Select Website</option>
                                {websites.map((website) => (
                                    <option key={website.id} value={website.id}>
                                        {website.website}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Profile Dropdown */}
                        <div className='col-md-3'>
                            <label htmlFor="profile" className="block text-gray-700 font-medium mb-2">
                                Profile
                            </label>
                            <select
                                id="profile"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                multiple={true}
                                value={selectedProfile}
                                ref={selectProfileref}
                            >
                                <option value="">Select Profile</option>
                                {profiles.map((profile) => (
                                    <option key={profile.profile_id} value={profile.profile_id}>
                                        {profile.profile_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='col-md-3'>
                            <label htmlFor="filter_date" className="block text-gray-700 font-medium mb-2">
                                Filter Date
                            </label>
                            <input
                                id="filterDate"
                                type="text"
                                className="form-control w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="From Date - To Date"
                                value={filterDate}
                                readOnly
                            />
                        </div>

                        {/* Status Dropdown */}
                        <div className='col-md-3'>
                            <label htmlFor="update_status" className="block text-gray-700 font-medium mb-2">
                                Status
                            </label>
                            <select
                                id="update_status"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={status}
                                ref={statusRef}
                                multiple={true}
                            >
                                <option value="">Select Status</option>
                                {allStatus.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.status_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='w-full flex items-center justify-end'>
                            <button
                                className='bg-orange-500 text-white py-1 px-2 rounded flex items-center'
                                type='button'
                                onClick={handleSearch}
                            >
                                search
                            </button>
                        </div>

                        <div className="p-4">
                        {searching && (
                                <div className="flex  items-center justify-center h-64">
                                    <CustomLoader />
                                </div>
                            )}
                            {searchedQueries.length > 0 && !searching && (
                                <div className="mb-2">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleCheckAll}
                                    />{' '}
                                    <span id="selectedRecord">Total Selected Records {selectedIds.length}</span>
                                </div>
                            )}
                            
                            {searchedQueries.length > 0 && !searching && (
                            <div className="h-64 overflow-y-auto border border-gray-300 rounded-lg text-sm">
                                <table className="table-fixed min-w-full text-left text-sm">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="w-8 p-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === searchedQueries.length}
                                                    onChange={(e) => handleCheckAll(e)}
                                                />
                                            </th>
                                            <th className="w-12 px-2 py-1">Name</th>
                                            <th className="w-18 px-2 py-1">Email</th>
                                            <th className="w-36 px-2 py-1">Website</th>
                                            <th className="w-24 px-2 py-1">Status</th>
                                            <th className="w-24 px-2 py-1">Assigned At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchedQueries.map((query) => (
                                            <tr
                                                key={query.assign_id}
                                                id={`deleteRow_${query.assign_id}`}
                                                className="odd:bg-white even:bg-gray-50  text-sm"
                                                style={{ backgroundColor: query.color_code || undefined }}
                                            >
                                                <td className="px-1 py-1">
                                                    <input
                                                        type="checkbox"
                                                        className="queryrow_data"
                                                        checked={selectedIds.includes(query.assign_id)}
                                                        onChange={() => handleCheckboxChange(query.assign_id)}
                                                    />
                                                </td>
                                                <td className="px-1 py-1 truncate">{query.name}</td>
                                                <td className="px-1 py-1 truncate">
                                                    <a href="#" title={query.name}>
                                                        {query.email_id}
                                                    </a>
                                                    {query.showBellicon === 1 && <span className="fa fa-bell-o ml-1" />}
                                                </td>
                                                <td className="px-1 py-1 truncate">
                                                    {query.website_name === 'others' ? query.other_website : query.website_name}
                                                </td>
                                                <td className="px-1 py-1 truncate">{query.status_name}</td>
                                                <td className="px-1 py-1">{new Date(query.assign_date * 1000).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            )}


                            <textarea
                                name="signature"
                                id="signature"
                                className="hidden"
                                value={Object.values(signatures).reverse().join('|||')}
                                readOnly
                            />
                        </div>

                        {/* Mail Body Editor */}
                        <div>
                            <label htmlFor="mail_body" className="block text-gray-700 font-medium my-2">
                                Mail Body
                            </label>
                            <ReactQuill
                                value={mailBody}
                                onChange={(content) => setMailBody(content)}
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, false] }],
                                        ['bold', 'italic'],
                                        [{ align: [] }],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                                formats={[
                                    'header', 'bold', 'italic', 'align',
                                    'list', 'bullet', 'link', 'image', 'clean'
                                ]}
                                style={{ height: 300 }}
                                placeholder="Compose your email..."
                            />
                        </div>


                        {/* Submit Button */}
                        <div className='flex justify-end mt-4'>
                            <button
                                type="submit"
                                disabled={posting}
                                className="bg-blue-500 text-white py-1 px-2 rounded flex items-center"
                            >
                                {posting ? <CustomLoader /> : 'Save Campaign'}
                            </button></div>
                    </div>

                </form></div>
        </motion.div>
    );
};

export default AddEmailCampaign;
