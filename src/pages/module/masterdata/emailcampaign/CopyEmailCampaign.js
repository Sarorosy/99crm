import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';
import axios from 'axios'; // Import axios for API requests
import $ from 'jquery';
import { Editor } from '@tinymce/tinymce-react'; // TinyMCE editor

const CopyEmailCampaign = ({ onClose, afterSave, campaignId }) => {
    const [camptitle, setCampTitle] = useState('');
    const [posting, setPosting] = useState(false);
    const [websites, setWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const [selectedProfile, setSelectedProfile] = useState('');
    const [profiles, setProfiles] = useState([]);
    const [status, setStatus] = useState('');
    const [mailBody, setMailBody] = useState('');
    const formRef = useRef(null);

    const selectWebsiteRef = useRef(null);
    const selectProfileref = useRef(null);

    useEffect(() => {
        fetchWebsites();
        fetchDetails();
    }, []);

    // Fetch websites from the API
    const fetchWebsites = async () => {
        try {
            const response = await axios.get('https://99crm.phdconsulting.in/99crmwebapi/api/websites');
            setWebsites(response.data.data); // Assuming response.data is the list of websites
        } catch (error) {
            console.error('Error fetching websites', error);
        }
    };

    // Fetch profiles based on selected website
    const fetchProfiles = async (websiteId) => {
        if (!websiteId) return; // If no website is selected, skip the API call
        
        try {
            const response = await axios.post('https://99crm.phdconsulting.in/99crmwebapi/api/getuserprofilewebsite', { website_id: websiteId });
            setProfiles(response.data.data); // Assuming response.data is the list of profiles
        } catch (error) {
            console.error('Error fetching profiles', error);
        }
    };

    // Fetch profiles based on selected website
    const fetchDetails = async () => {
        
        try {
            const response = await axios.get(`https://99crm.phdconsulting.in/99crmwebapi/api/getcampaigndetails/${campaignId.id}`);
            setCampTitle(response.data.data.camp_title);
            setMailBody(response.data.data.email_body)
        } catch (error) {
            console.error('Error fetching profiles', error);
        }
    };

    // Handler for when the website dropdown changes
    const handleWebsiteChange = (e) => {
        const websiteId = e.target.value;
        setSelectedWebsite(websiteId); // Set the selected website
        fetchProfiles(websiteId); // Fetch profiles for the selected website
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

        if (!camptitle || !selectedWebsite || !mailBody || !selectedProfile || !status) {
            if (!camptitle) toast.error('Campaign title is required');
            if (!selectedWebsite) toast.error('Website is required');
            if (!mailBody) toast.error('Email body is required');
            if (!selectedProfile) toast.error('Profile is required');
            if (!status) toast.error('Status is required');
            setPosting(false);
            return; // Stop the form submission
        }

        

        try {
            // POST request to the API
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/addemailcampaign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // Set Content-Type to application/json
                },
                body: JSON.stringify({
                    camp_title: camptitle,
                    camp_website: selectedWebsite, // Use selectedWebsite value
                    email_body: mailBody, // Ensure you are sending a valid email body
                }),
            });
            

            const data = await response.json();

            if (response.ok) {
                console.log('Success:', data);
                formRef.current.reset();
                toast.success('Campaign added successfully');
                setTimeout(() => {
                    onClose();
                    afterSave();
                }, 1500);
            } else {
                console.error('Error:', data);
                toast.error('Error occurred while creating the campaign');
            }
        } catch (error) {
            console.error('Error during API call:', error);
            toast.error('Error occurred while creating the campaign');
        } finally {
            setPosting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <ToastContainer />
            <div className='mx-auto w-2/3 relative'>
                <h2 className="text-xl font-bold mb-6 text-left ">Add Email Campaign</h2>
                <button
                    onClick={onClose}
                    className="absolute top-0 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-4 border-t-2 rounded border-blue-400 w-2/3 mx-auto bg-white shadow-xl">
                {/* Email Campaign Subject */}
                <div>
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

                {/* Website Dropdown */}
                <div>
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
                <div>
                    <label htmlFor="profile" className="block text-gray-700 font-medium mb-2">
                        Profile
                    </label>
                    <select
                        id="profile"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        
                        value={selectedProfile}
                        onChange={(e) => setSelectedProfile(e.target.value)}
                    >
                        <option value="">Select Profile</option>
                        {profiles.map((profile) => (
                            <option key={profile.profile_id} value={profile.profile_id}>
                                {profile.profile_name}
                            </option>
                        ))}
                    </select>
                </div>

                

                {/* Status Dropdown */}
                <div>
                    <label htmlFor="update_status" className="block text-gray-700 font-medium mb-2">
                        Status
                    </label>
                    <select
                        id="update_status"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        
                    >
                        <option value="">Select Status</option>
                        <option value="1">Lead In</option>
                        <option value="2">Contact Made</option>
                        <option value="3">Quoted</option>
                        <option value="5">Converted</option>
                        <option value="6">Client Not Interested</option>
                        <option value="7">Reminder</option>
                        <option value="8">Lost Deals</option>
                        <option value="9">Contact Not Made</option>
                        <option value="10">Cross Sell</option>
                    </select>
                </div>

                {/* Mail Body Editor */}
                <div>
                    <label htmlFor="mail_body" className="block text-gray-700 font-medium mb-2">
                        Mail Body
                    </label>
                    <Editor
                        apiKey="2crkajrj0p3qpzebc7qfndt5c6xoy8vwer3qt5hsqqyv8hb8"
                        value={mailBody}
                        init={{
                            height: 300,
                            menubar: false,
                            plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'print', 'preview', 'anchor', 'searchreplace', 'wordcount'],
                            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
                        }}
                        onEditorChange={(content, editor) => setMailBody(content)}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={posting}
                    className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-lg mt-6 hover:bg-blue-600 focus:outline-none"
                >
                    {posting ? <CustomLoader /> : 'Save Campaign'}
                </button>
            </form>
        </motion.div>
    );
};

export default CopyEmailCampaign;
