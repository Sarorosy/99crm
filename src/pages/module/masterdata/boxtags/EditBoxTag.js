import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';

const EditBoxTag = ({ onClose, afterSave, tagId }) => {
    const [tagName, setTagName] = useState('');
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTagDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/boxtagdetails/${tagId.id}`);
                const data = await response.json();

                if (response.ok && data) {
                    setTagName(data.data.box_tag_name || '');
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
        };

        try {
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/updateboxtag/${tagId.id}`, {
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
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md relative qhpage col-md-3">
                <button
                    onClick={onClose}
                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>

                <h2 className="text-md font-bold mb-3 text-center">Edit Box Tag</h2>
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
                   

                    <div className="text-end">
                        <button
                            type="submit"
                            disabled={posting}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {posting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            )}
                        </div>

            
        </motion.div>
    );
};

export default EditBoxTag;
