import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';

const AddBoxTag = ({ onClose, afterSave }) => {
    const [tagName, setTagName] = useState('');
    const [posting, setPosting] = useState(false);
    const formRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);

        const formData = new FormData();
        formData.append('tag_name', tagName);

        try {
            // POST request to the API
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/createboxtag', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Success:', data);
                formRef.current.reset();
                toast.success('Tag added successfully');
                setTimeout(() => {
                    onClose();
                    afterSave();
                }, 1500);
            } else {
                console.error('Error:', data);
                toast.error('Error occurred while creating the tag');
            }
        } catch (error) {
            console.error('Error during API call:', error);
            toast.error('Error occurred while creating the tag');
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
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md relative qhpage col-md-3">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>
                <h2 className="text-xl font-bold mb-6 text-center">Add Box Tag</h2>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    {/* Tag Name */}
                    <div>
                        <label htmlFor="tagName" className="block text-gray-700 font-medium mb-2">
                            Tag Name *
                        </label>
                        <input
                            type="text"
                            id="tagName"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            required
                        />
                    </div>



                    {/* Submit Button */}
                    <div className="text-end">
                        <button
                            type="submit"
                            disabled={posting}
                            className="px-3 py-1 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors cremove"
                        >
                            {posting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>

                {posting && (
                    <div className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white px-6 py-3 rounded-lg shadow-lg text-center">
                            <CustomLoader className="h-24" />
                            <p className="mt-1 text-lg font-semibold">Saving your changes...</p>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </motion.div>
    );
};

export default AddBoxTag;
