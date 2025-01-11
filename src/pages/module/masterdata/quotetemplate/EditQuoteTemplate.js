import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.css';
import 'select2';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX } from 'lucide-react';
import CustomLoader from '../../../../components/CustomLoader';

const EditQuoteTemplate = ({ onClose, afterSave, templateId }) => {
    const [serviceName, setServiceName] = useState('');
    const [websites, setWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const selectTeamRef = useRef(null);
    const [loading,setLoading] = useState(false);

    const fetchWebsites = async () => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/websites');
            const data = await response.json();
            if (data.status) {
                setWebsites(data.data); // Assuming data.data contains the websites
            } else {
                console.error('Failed to fetch websites');
            }
        } catch (err) {
            console.error('Error fetching websites:', err);
        }
    };

    // Fetch template Details
    const fetchTemplateDetails = async (id) => {
        try {
            setLoading(true)
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/getquotetemplate/${id}`);
            const data = await response.json();
            if (data.status && data.data) {
                const template = data.data;
                setServiceName(template.quote_service_name);
                setSelectedWebsite(template.website_id ? template.website_id : '');
            } else {
                console.error('Failed to fetch template details');
            }
        } catch (err) {
            console.error('Error fetching template details:', err);
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebsites(); // Call the function to fetch websites

        if (templateId) {
            fetchTemplateDetails(templateId.id); // Call the function to fetch template details
        }
    }, [templateId]);

    useEffect(() => {
        // Initialize select2 for Select template
        $(selectTeamRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedWebsite($(e.target).val());
        });
        if (selectedWebsite != '') {
            $(selectTeamRef.current).val(selectedWebsite).trigger('change');
        }
    

        return () => {
            // Destroy select2 when the component unmounts
            if (selectTeamRef.current) {
                $(selectTeamRef.current).select2('destroy');
            }
        };
    }, [websites]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!serviceName || !selectedWebsite) {
            toast.error('Please fill in the Service name and Website.');
            return;
        }

        // Post the data (template name and selected manager IDs as comma-separated values)
        const payload = {
            service_name: serviceName,
            website_id: selectedWebsite,
        };

        fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/updatequotetemplate/${templateId.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    toast.success('template updated successfully');
                    setServiceName('');
                    setSelectedWebsite('');
                    setTimeout(()=>{
                        onClose();
                        afterSave();
                    },1000)
                } else {
                    toast.error('Failed to update template');
                }
            })
            .catch(err => toast.error('Error updating template:', err));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <h2 className="text-xl text-center font-semibold mb-4">Edit Template</h2>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
                <CircleX size={32} />
            </button>
            {loading ? (<CustomLoader />) : (
                <div className='col-md-6 cent add'>
<form onSubmit={handleSubmit} className='space-y-4 p-4 border-t-2 bg-white rounded border-blue-400 shadow-xl'>
                <div className="flex w-full space-x-3 justify-center">
                    {/* template Name Field */}
                    <div className="form-group w-1/2 mx-2">
                        <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-2">template Name</label>
                        <input
                            type="text"
                            id="team_name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            placeholder="Enter template name"
                            required
                        />
                    </div>

                    {/* Manager Name Field */}
                    <div className="form-group w-1/2 mx-2">
                        <label htmlFor="website_id" className="block text-sm font-medium text-gray-700 mb-2">Manager Name(s)</label>
                        <select
                            id="manager_name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedWebsite}
                            ref={selectTeamRef}
                        >
                            {websites.map(website => (
                                <option key={website.id} value={website.id}>
                                    {website.website}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='text-end'>
                    <button
                        type="submit"
                        className="mt-3 px-3 py-1 mx-auto bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Update Template
                    </button>
                </div>

            </form>
                </div>
            
            )}
            <ToastContainer />
        </motion.div>
    );
};

export default EditQuoteTemplate;
