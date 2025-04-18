import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CircleX } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../../../../components/CustomLoader';

const EditFollowupSetting = ({ onClose, afterSave, settingId }) => {
    const [priorityName, setPriorityName] = useState('');
    const [settings, setSettings] = useState([]);
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch follow-up settings when component mounts or settingId changes
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://99crm.phdconsulting.in/zend/99crmwebapi/api/followupsettingdetails/${settingId.id}`);
                const data = await response.json();

                if (response.ok && data) {
                    setPriorityName(data.data.priority);

                    // Split comma-separated values into arrays
                    const followUpDays = data.data.follow_up_day.split(',');
                    const contactByOptions = data.data.contact_by.split(',');

                    // Combine the followUpDays and contactByOptions into a list of objects
                    const followUpSettings = followUpDays.map((day, index) => ({
                        days: day,
                        contactBy: contactByOptions[index] || '',
                    }));

                    setSettings(followUpSettings);
                } else {
                    throw new Error('Failed to load settings');
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Failed to load follow-up settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [settingId]);

    // Add new follow-up setting group
    const handleAddGroup = () => {
        setSettings([...settings, { days: '', contactBy: '' }]);
    };

    // Remove a follow-up setting group
    const handleRemoveGroup = (index) => {
        const updatedSettings = settings.filter((_, i) => i !== index);
        setSettings(updatedSettings);
    };

    // Handle input change for follow-up days and contact method
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

        const payload = {
            priorityName: priorityName,
            days: daysArray,          // Send comma-separated days
            contactBy: contactByArray // Send comma-separated contactBy
        };

        try {
            const response = await fetch(`https://99crm.phdconsulting.in/zend/99crmwebapi/api/updatefollowupsetting/${settingId.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Priority updated successfully");
                setTimeout(() => {
                    onClose();
                    afterSave();
                });
            } else {
                toast.error("Error occurred while updating");
            }
        } catch (error) {
            toast.error("Error occurred while updating");
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
            <div className="bg-white rounded-lg shadow-lg col-md-3 qhpage p-4 relative">
                <button
                    onClick={onClose}
                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>

                <h2 className="text-md font-bold mb-3 text-center">Edit Follow-Up Setting</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center">
                        <CustomLoader className="h-24" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Priority Name */}
                        <div className='mb-4'>
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
                                <div key={index} className="flex items-center space-x-4 mb-4">
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
                                    {/* Remove Button */}
                                    {settings.length > 1 && (
                                        <button
                                            type="button"
                                            className="text-red-600 hover:text-red-800 transition-colors text-xl"
                                            onClick={() => handleRemoveGroup(index)}
                                        >
                                            -
                                        </button>
                                    )}
                                    {/* Add Button */}
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
                )}

                {/* Loader when posting */}
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

export default EditFollowupSetting;
