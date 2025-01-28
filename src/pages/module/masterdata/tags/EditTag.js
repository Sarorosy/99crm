import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';

const EditTag = ({ onClose, afterSave, tagId }) => {
    const [tagName, setTagName] = useState('');
    const [category, setCategory] = useState('');
    const [tagType, setTagType] = useState('');
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTagDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/tagdetails/${tagId.id}`);
                const data = await response.json();

                if (response.ok && data) {
                    setTagName(data.data.tag_name || '');
                    setCategory(data.data.category || '');
                    setTagType(data.data.tag_type || '');
                } else {
                    throw new Error('Failed to load tag details');
                }
            } catch (error) {
                console.error('Error fetching tag details:', error);
                toast.error('Failed to load tag details');
            } finally {
                setLoading(false);
            }
        };

        fetchTagDetails();
    }, [tagId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);

        const payload = {
            tag_name: tagName,
            category,
            tag_type: tagType,
        };

        try {
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/updatetag/${tagId.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Tag updated successfully');
                setTimeout(() => {
                    onClose();
                    afterSave();
                }, 500);
            } else {
                console.error('Error:', data);
                toast.error('Error occurred while updating');
            }
        } catch (error) {
            console.error('Error during API call:', error);
            toast.error('Error occurred while updating');
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

            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative qhpage">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>

                <h2 className="text-xl font-bold mb-6 text-center">Edit Tag</h2>
            {loading ? (
                <CustomLoader />
            ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <div className='col-md-12 flex'>
                            <div className='col-md-6'>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Category *</label>
                                    <div className="space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="PhD"
                                                checked={category === "PhD"}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="form-radio text-blue-500"
                                            />
                                            <span className="ml-2">PhD</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="Sales"
                                                checked={category === "Sales"}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="form-radio text-blue-500"
                                            />
                                            <span className="ml-2">Sales</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-6'>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Tag Type *</label>
                                    <div className="space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="tagType"
                                                value="Primary"
                                                checked={tagType === "Primary"}
                                                onChange={(e) => setTagType(e.target.value)}
                                                className="form-radio text-blue-500"
                                            />
                                            <span className="ml-2">Primary</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                name="tagType"
                                                value="Secondary"
                                                checked={tagType === "Secondary"}
                                                onChange={(e) => setTagType(e.target.value)}
                                                className="form-radio text-blue-500"
                                            />
                                            <span className="ml-2">Secondary</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-end">
                            <button
                                type="submit"
                                disabled={posting}
                                className="bg-blue-500 px-2 py-1 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cremove"
                            >
                                {posting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>

            )}
                        </div>

            <ToastContainer />
        </motion.div>
    );
};

export default EditTag;
