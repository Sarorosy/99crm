import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
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
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <div className='mx-auto w-2/3 relative'>
                <button
                    onClick={onClose}
                    className="absolute top-0 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                    <CircleX size={32} />
                </button>

                <h2 className="text-xl font-bold mb-6 text-center">Edit Box Tag</h2>
            </div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className='col-md-5 cent add'>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border-t-2 rounded border-blue-400 w-2/3 mx-auto bg-white shadow-xl">
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
                   

                    <div className="text-end buton">
                        <button
                            type="submit"
                            disabled={posting}
                            className="px-4 py-1 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {posting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
                </div>          
            )}
            <ToastContainer />
        </motion.div>
    );
};

export default EditBoxTag;
