import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import 'select2/dist/css/select2.css';
import 'select2';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircleX } from 'lucide-react';
import CustomLoader from '../../../../components/CustomLoader';

const EditTeam = ({ onClose, afterSave, teamId }) => {
    const [teamName, setTeamName] = useState('');
    const [managers, setManagers] = useState([]);
    const [selectedManagers, setSelectedManagers] = useState([]);
    const selectTeamRef = useRef(null);
    const [loading,setLoading] = useState(false);

    const fetchManagers = async () => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getmanagers');
            const data = await response.json();
            if (data.status) {
                setManagers(data.data); // Assuming data.data contains the managers
            } else {
                console.error('Failed to fetch managers');
            }
        } catch (err) {
            console.error('Error fetching managers:', err);
        }
    };

    // Fetch Team Details
    const fetchTeamDetails = async (id) => {
        try {
            setLoading(true)
            const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/getteam/${id}`);
            const data = await response.json();
            if (data.status && data.data) {
                const team = data.data;
                setTeamName(team.team_name);
                setSelectedManagers(team.team_manager ? team.team_manager.split(',') : []);
            } else {
                console.error('Failed to fetch team details');
            }
        } catch (err) {
            console.error('Error fetching team details:', err);
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagers(); // Call the function to fetch managers

        if (teamId) {
            fetchTeamDetails(teamId.id); // Call the function to fetch team details
        }
    }, [teamId]);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectTeamRef.current).select2({
            placeholder: "Select Team Manager",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            setSelectedManagers($(e.target).val());
        });
        if (selectedManagers.length > 0) {
            $(selectTeamRef.current).val(selectedManagers).trigger('change');
        }
    

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
            alert('Please fill in the team name and select at least one manager.');
            return;
        }

        // Post the data (team name and selected manager IDs as comma-separated values)
        const payload = {
            team_name: teamName,
            manager_ids: selectedManagers.join(','),
        };

        fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/updateteam/${teamId.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    toast.success('Team updated successfully');
                    setTeamName('');
                    setSelectedManagers([]);
                    setTimeout(()=>{
                        onClose();
                        afterSave();
                    },1000)
                } else {
                    toast.error('Failed to update team');
                }
            })
            .catch(err => toast.error('Error updating team:', err));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <h2 className="text-xl font-semibold mb-4 text-center">Edit Team</h2>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
            >
                <CircleX size={32} />
            </button>
            {loading ? (<CustomLoader />) : (
                <div className='col-md-4 cent add'>
            <form onSubmit={handleSubmit} className='space-y-4 p-4 border-t-2 bg-white rounded border-blue-400 shadow-xl'>
                <div className="w-full">
                    {/* Team Name Field */}
                    <div className="form-group mb-3">
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
                    <div className="form-group">
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
                        className="mt-3 py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Update Team
                    </button>
                </div>

            </form>
            </div>
            )}
            <ToastContainer />
        </motion.div>
    );
};

export default EditTeam;
