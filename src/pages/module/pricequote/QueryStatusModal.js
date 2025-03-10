import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const QueryStatusModal = ({ onClose, onSubmit, selectedId, after }) => {
    const [queryStatus, setQueryStatus] = useState('');
    const [comments, setComments] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!queryStatus) {
            toast.error("Please select status");
            return;
        }
        if (!comments) {
            toast.error("Please enter comments");
            return;
        }
    
        if (!window.confirm('Are You Sure? Please confirm')) return;
    
        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/updatequotestatus", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service_id: selectedId,
                    query_status: queryStatus,
                    query_status_comment: comments
                }),
            });
    
            const data = await response.json();
    
            if (data.status) {
                toast.success(data.message || "Status updated successfully!");
                onClose();
                after(); // Call after function if necessary
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            // toast.error("An error occurred. Please try again.");
        }
    };
    


    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white p-6 rounded-lg shadow-lg w-96"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
            >
                <h2 className="text-lg font-semibold mb-4">Update Query Status </h2>
                <form >
                    <input type="hidden" name="service_id" value={selectedId} required />
                    <div className="mb-4">
                        <select
                            name="query_status"
                            className="w-full p-2 border rounded"
                            value={queryStatus}
                            onChange={(e) => setQueryStatus(e.target.value)}
                            required
                        >
                            <option value="">Select</option>
                            <option value="Call unanswered">Call unanswered</option>
                            <option value="Price issue">Price issue</option>
                            <option value="Client needs time">Client needs time</option>
                            <option value="Low budget">Low budget</option>
                            <option value="In discussion">In discussion</option>
                            <option value="PTP">PTP</option>
                            <option value="Client not interested">Client not interested</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <textarea
                            className="w-full p-2 border rounded"
                            name="query_status_comment"
                            placeholder="Add Comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            className="bg-gray-400 text-white px-2 py-1 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button onClick={handleSubmit} className="bg-blue-500 text-white px-2 py-1 rounded">
                            Update
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default QueryStatusModal;
