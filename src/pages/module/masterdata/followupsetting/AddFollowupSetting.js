import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';

const AddFollowupSetting = ({ onClose, afterSave }) => {
    const [priorityName, setPriorityName] = useState('');
    const [settings, setSettings] = useState([{ days: '', contactBy: '' }]);
    const [posting, setPosting] = useState(false);
    const formRef = useRef(null);

    // Add new group for follow-up settings
    const handleAddGroup = () => {
        setSettings([...settings, { days: '', contactBy: '' }]);
    };

    // Remove group for follow-up settings
    const handleRemoveGroup = (index) => {
        const updatedSettings = settings.filter((_, i) => i !== index);
        setSettings(updatedSettings);
    };

    // Handle input change for days and contactBy fields
    const handleInputChange = (index, field, value) => {
        const updatedSettings = [...settings];
        updatedSettings[index][field] = value;
        setSettings(updatedSettings);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);

        // Extract days and contactBy values as arrays
        const daysArray = settings.map(group => group.days).join(',');
        const contactByArray = settings.map(group => group.contactBy).join(',');

        const formData = new FormData();
        formData.append('priorityName', priorityName);
        formData.append('days', daysArray);          // Send comma-separated days
        formData.append('contactBy', contactByArray); // Send comma-separated contactBy

        try {
            // POST request to the API
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/createpriority', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Success:', data);
                formRef.current.reset(); // Reset form after submission
                toast.success("Priority added successfully");
                setTimeout(() => {
                    onClose(); // Close the modal
                    afterSave(); // Trigger afterSave action
                });
            } else {
                console.error('Error:', data);
                toast.error(data?.message || "Error occurred while creating the priority.");
            }
        } catch (error) {
            console.error('Error during API call:', error);
            toast.error("An error occurred while creating the priority.");
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
            className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center z-50"
        >
            <div className="bg-white rounded-lg shadow-lg p-4 relative qhpage col-md-3">
                <button
                    onClick={onClose}
                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>

                <h2 className="text-md font-bold mb-3 text-center">Add Follow-Up Setting</h2>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    {/* Priority Name */}
                    <div>
                        <label htmlFor="priorityName" className="block text-gray-700 font-medium mb-2">
                            Priority Name *
                        </label>
                        <input
                            type="text"
                            id="priorityName"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={priorityName}
                            onChange={(e) => setPriorityName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Dynamic Follow-Up Settings */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Follow-Up Settings *</label>
                        {settings.map((group, index) => (
                            <div key={index} className="flex items-center space-x-4 mb-1">
                                {/* No. of Days */}
                                <input
                                    type="number"
                                    placeholder="No. of Days"
                                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={group.days}
                                    onChange={(e) => handleInputChange(index, 'days', e.target.value)}
                                    required
                                    min={1}
                                />
                                {/* Contact By */}
                                <select
                                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={group.contactBy}
                                    onChange={(e) => handleInputChange(index, 'contactBy', e.target.value)}
                                    required
                                >
                                    <option value="">Contact By</option>
                                    <option value="Phone">Phone</option>
                                    <option value="Email">Email</option>
                                    <option value="Chat">Chat</option>
                                </select>
                                {/* Remove Group Button */}
                                {settings.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-600 hover:text-red-800 transition-colors text-xl"
                                        onClick={() => handleRemoveGroup(index)}
                                    >
                                        -
                                    </button>
                                )}
                                {/* Add Group Button */}
                                {index === settings.length - 1 && (
                                    <button
                                        type="button"
                                        className="text-green-600 hover:text-green-800 transition-colors text-xl"
                                        onClick={handleAddGroup}
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="text-end">
                        <button
                            type="submit"
                            disabled={posting}
                            className="px-2 py-1 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
                        >
                            {posting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>

                {/* Loader Overlay */}
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

export default AddFollowupSetting;
