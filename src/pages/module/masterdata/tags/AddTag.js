import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';

const AddTag = ({ onClose, afterSave }) => {
    const [tagName, setTagName] = useState('');
    const [category, setCategory] = useState('Phd'); // Default to 'Phd'
    const [tagType, setTagType] = useState('Primary'); // Default to 'Primary'
    const [posting, setPosting] = useState(false);
    const formRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);

        const formData = new FormData();
        formData.append('tag_name', tagName);
        formData.append('category', category);
        formData.append('tag_type', tagType);

        try {
            // POST request to the API
            const response = await fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/createtag', {
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
            <div className="bg-white p-4 rounded-lg shadow-xl  max-w-md relative qhpage col-md-3">
                <button
                                    onClick={onClose}
                                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                                >
                                    <CircleX size={32} />
                                </button>
                <h2 className="text-md font-bold mb-2 text-center">Add Tag</h2>

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
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

                        <div>
                            {/* Category */}
                            <div className="col-md-12 mb-2">
                                <label className="block text-gray-700 font-medium mb-2">Category *</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Phd"
                                            checked={category === 'Phd'}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                        <span>Phd</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="Sales"
                                            checked={category === 'Sales'}
                                            onChange={(e) => setCategory(e.target.value)}
                                        />
                                        <span>Sales</span>
                                    </label>
                                </div>
                            </div>

                            {/* Tag Type */}
                            <div className="col-md-12">
                                <label className="block text-gray-700 font-medium mb-2">Tag Type *</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="tagType"
                                            value="Primary"
                                            checked={tagType === 'Primary'}
                                            onChange={(e) => setTagType(e.target.value)}
                                        />
                                        <span>Primary</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="tagType"
                                            value="Secondary"
                                            checked={tagType === 'Secondary'}
                                            onChange={(e) => setTagType(e.target.value)}
                                        />
                                        <span>Secondary</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="text-end mt-0">
                            <button
                                type="submit"
                                disabled={posting}
                                className="px-3 py-1 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
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

            
        </motion.div>
    );
};

export default AddTag;
