import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.css';
import 'select2';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX } from 'lucide-react';

const AddTeam = ({ onClose, afterSave }) => {
    const [teamName, setTeamName] = useState('');
    const [managers, setManagers] = useState([]);
    const [selectedManagers, setSelectedManagers] = useState([]);
    const selectTeamRef = useRef(null);

    useEffect(() => {
        // Fetch managers data from the API
        fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/getmanagers')
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    setManagers(data.data); // Assuming data.data contains the managers
                } else {
                    console.error('Failed to fetch managers');
                }
            })
            .catch(err => console.error('Error fetching managers:', err));
    }, []);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectTeamRef.current).select2({
            placeholder: "Select Team Manager",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            setSelectedManagers($(e.target).val());
        });

        return () => {
            // Destroy select2 when the component unmounts
            if (selectTeamRef.current) {
                $(selectTeamRef.current).select2('destroy');
            }
        };
    }, [managers]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!teamName || selectedManagers.length === 0) {
            toast.error('Please fill in the team name and select at least one manager.');
            return;
        }

        // Post the data (team name and selected manager IDs as comma-separated values)
        const payload = {
            team_name: teamName,
            manager_ids: selectedManagers.join(','),
        };

        fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/addteam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    toast.success('Team added successfully');
                    setTeamName('');
                    setSelectedManagers([]);
                    onClose();
                    afterSave();  // Refresh the list after saving
                } else {
                    toast.error('Failed to add team');
                }
            })
            .catch(err => toast.error('Error submitting team:', err));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
            <div className="bg-white rounded-lg shadow-lg p-4 relative qhpage col-md-3">
                <button
                    onClick={onClose}
                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>

                <h2 className="text-md text-center font-semibold mb-2">Add New Team</h2>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className="w-full">
                        {/* Team Name Field */}
                        <div className="form-group mx-1 mb-3">
                            <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                            <input
                                type="text"
                                id="team_name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter team name"
                                required
                            />
                        </div>

                        {/* Manager Name Field */}
                        <div className="form-group mx-1">
                            <label htmlFor="manager_name" className="block text-sm font-medium text-gray-700 mb-2">Manager Name(s)</label>
                            <select
                                id="manager_name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                multiple
                                value={selectedManagers}
                                ref={selectTeamRef}
                            >
                                {managers.map(manager => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='text-end'>
                        <button
                            type="submit"
                            className="mt-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Add Team
                        </button>
                    </div>
                </form>
            </div>
            
        </motion.div>
    );
};

export default AddTeam;
