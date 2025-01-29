import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.css';
import 'select2';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX } from 'lucide-react';


const AddQuoteTemplate = ({ onClose, afterSave }) => {
    const [serviceName, setServiceName] = useState('');
    const [websites, setWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const selectWebsiteRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch websites data from the API
        fetch('https://99crm.phdconsulting.in/99crmwebapi/api/websites')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setWebsites(data.data); // Assuming data.data contains the websites
                } else {
                    console.error('Failed to fetch websites');
                }
            })
            .catch(err => console.error('Error fetching websites:', err));



    }, []);
    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectWebsiteRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedWebsite($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectWebsiteRef.current) {
                // $(selectWebsiteRef.current).select2('destroy');
            }
        };
    }, [websites]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (!serviceName || !selectedWebsite) {
            alert('Please fill in the service name and select a website.');
            return;
        }

        // Post the data (team name and selected manager IDs as comma-separated values)
        const payload = {
            service_name: serviceName,
            website_id: selectedWebsite
        };

        fetch('https://99crm.phdconsulting.in/99crmwebapi/api/addquotetemplate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    toast.success('Template added successfully');
                    setServiceName('');
                    setSelectedWebsite('');
                    onClose();
                    afterSave()
                } else {
                    toast.error('Failed to add Template');
                }
            })
            .catch(err => toast.error('Error submitting team:', err))
            .finally(() => {
                setLoading(false);  // Set loading to false after the fetch operation
            });
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
        <div className="bg-white p-4 rounded-lg shadow-xl  max-w-md relative qhpage col-md-3">
            <button
                onClick={onClose}
                className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
            >
                <CircleX size={32} />
            </button>
            <h2 className="text-md font-semibold mb-2 text-center">Add Quote Template</h2>
            
                <form onSubmit={handleSubmit} className='space-y-3'>
                    <div className="w-full space-x-3 justify-center">
                        {/* Team Name Field */}
                        <div className="form-group mx-2 mb-2">
                            <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                            <input
                                type="text"
                                id="service_name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={serviceName}
                                onChange={(e) => setServiceName(e.target.value)}
                                placeholder="Service Name"
                                required
                            />
                        </div>

                        {/* Manager Name Field */}
                        <div className="form-group mx-2">
                            <label htmlFor="website_id" className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <select
                                id="website_id"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

                                value={selectedWebsite}
                                ref={selectWebsiteRef}
                            >
                                <option value=""> Select Website</option>
                                {websites.map(website => (
                                    <option key={website.id} value={website.id}>
                                        {website.website}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='text-end mr-2'>
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 px-3 py-1 mx-auto bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {loading ? 'Submitting..' : "Submit"}
                        </button>
                    </div>

                </form></div>
            <ToastContainer />
        </motion.div>
    );

};

export default AddQuoteTemplate;
