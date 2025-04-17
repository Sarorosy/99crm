import { X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const CommentForm = ({ queryInfo, onClose , status, after}) => {
    const [comments, setComments] = useState("");
    const [shiftToLead, setShiftToLead] = useState(false);
    const [shiftToOpen, setShiftToOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!comments.trim()) {
            toast.error("Comments cannot be empty!");
            setIsSubmitting(false);
            return;
        }
    
        // Prepare the raw data to send in the request
        const rawData = {
            assign_id: queryInfo.assign_id,
            query_id: queryInfo.id,
            comments: comments,
            user_id: sessionStorage.getItem('id'),
            user_type: sessionStorage.getItem('user_type'),
            update_status1: status,
            old_status: queryInfo.update_status,
            remainder_date: queryInfo.remainder_date ? new Date(queryInfo.remainder_date).toLocaleDateString() : "", 
            accessQueryShiftComment: sessionStorage.getItem("accessQueryShiftComment"),
            shift_to_open: shiftToOpen ? 1 : 0,
            shift_to_lead: shiftToLead ? 1 : 0
        };
    
        try {
            // Make the POST request using fetch
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/onlycommentsubmit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rawData),
            });
    
            const data = await response.json();
            
            // Check if response is successful
            if (data.status) {
                toast.success("Comment Submitted!");
                after();
                onClose(); // Close the form after successful submission
            } else {
                toast.error("Error submitting comment! Please try again.");
            }
        } catch (error) {
            // Handle network or other errors
            toast.error("Error submitting comment!");
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    

    return (
        <div className="relative max-w-2xl bg-white p-6 rounded-lg shadow-lg mx-auto mt-3">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-500 p-1 rounded-full transition"
            >
                <X size={10} />
            </button>

            <div className="flex items-center space-x-2">

                <div className="mb-4 w-2/3">
                    <label className="block text-gray-700 font-medium">Comments</label>
                    <textarea
                        name="comments"
                        id="comments"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ height: "100px" }}
                        placeholder="Write a comment..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>

                {/* Checkboxes */}
                <div className="mb-4 w-1/3 flex items-center justify-center flex-col">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="shift_to_lead"
                            value="1"
                            checked={shiftToLead}
                            onChange={(e) => setShiftToLead(e.target.checked)}
                            className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Shift To Lead</span>
                    </label>
                    <label className="flex items-center space-x-2 mt-2">
                        <input
                            type="checkbox"
                            name="shift_to_open"
                            value="1"
                            checked={shiftToOpen}
                            onChange={(e) => setShiftToOpen(e.target.checked)}
                            className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Shift To Open</span>
                    </label>
                </div>

            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                {!isSubmitting ? (
                    <button
                        onClick={handleSubmit}
                        type="button"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-2 rounded-md transition"
                    >
                        Submit
                    </button>
                ) : (
                    <button
                        disabled
                        className="bg-gray-400 text-white font-medium py-2 px-4 rounded-md cursor-not-allowed"
                    >
                        Please Wait...
                    </button>
                )}
            </div>
        </div>
    );
};

export default CommentForm;
