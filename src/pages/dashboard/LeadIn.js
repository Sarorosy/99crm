import { Bell, Calendar } from 'lucide-react';
import React from 'react';
import SkeletonLoader from './SkeletonLoader';
import { AnimatePresence } from 'framer-motion';
import QueryDetails from '../managequery/QueryDetails';
import { useState } from 'react';


const LeadIn = ({ queries , loading}) => {

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedRefId, setSelectedRefId] = useState('');

    const getDueTime = (timestamp) => {
        const currentDate = new Date();
        const dueDate = new Date(parseInt(timestamp) * 1000);
        const diffInMonths = (currentDate - dueDate) / (1000 * 60 * 60 * 24 * 30);
        const diffInYears = diffInMonths / 12;

        if (diffInYears >= 1) {
            return `${Math.floor(diffInYears)} Year(s) ago`;
        } else if (diffInMonths >= 1) {
            return `${Math.floor(diffInMonths)} Month(s) ago`;
        }
        return 'Just now';
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 1: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal rounded-full px-2 py-0 pull-right">Lead In</span>;
            case 2: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal rounded-full px-2 py-0  pull-right">Contact Made</span>;
            case 3: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal rounded-full px-2 py-0  pull-right">Quoted</span>;
            case 4: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal rounded-full px-2 py-0  pull-right">Negotiating</span>;
            case 5: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal rounded-full px-2 py-0  pull-right">Converted</span>;
            case 6: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal rounded-full px-2 py-0 pull-right">Client Not Interested</span>;
            case 7: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal rounded-full px-2 py-0 pull-right">Reminder</span>;
            default: return null;
        }
    };

    const handleViewButtonClick = (data) => {
        setSelectedRefId(data.assign_id);
        setDetailsOpen(true);
    }

    return (
        <div className="open-tasks-container w-1/5" style={{ padding: '20px 8px', border: '1px solid #ddd', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#f9f9f9', maxWidth: '350px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>Lead In <span className='text-blue-900 bg-white rouneded-full px-1 py-1 mx-2'>({queries && queries.length})</span></h1>
            <ul className=" custom-scrollbar box-height h-96 overflow-y-scroll" id="sortable3">
                {loading ? <SkeletonLoader /> :queries.map((task) => (
                    <li
                        key={task.assign_id}
                        id={task.assign_id}
                        className={`itemborder rounded-sm mb-2 px-2 py-1 shadow-md text-sm cursor-pointer duration-300`}
                        style={{backgroundColor :task.color_code ?? "white"}}
                        onClick={() => handleViewButtonClick(task)} // Replace with your actual function
                    >
                        <div className="product-info px-1">
                            <a
                                href="javascript:void(0)"
                                className="font-bold text-blue-950 "
                                data-placement="bottom"
                                data-toggle="tooltip"
                                data-original-title={task.email_id}
                            >
                                <p className='flex items-center'>
                                {task.name}
                                {task.showBellicon == 1 ? (
                                    <Bell size={16} className="text-red-500 ml-1" />
                                ) : (
                                    ""
                                )}
                                {task.reconnect_date && new Date(task.reconnect_date * 1000) >= new Date() && (
                                    <Calendar size={16} className="ml-1" />
                                )}

                                </p>
                               {getStatusLabel(task.update_status)}
                            </a>
                            <span className="product-description text-gray-600 mt-1 block">
                                Ref. No. : {task.assign_id}
                                {task.open_date && task.open_status == '0' && (
                                    <div className="timerCls mt-1">
                                        <a
                                            href="javascript:void(0)"
                                            data-placement="bottom"
                                            data-toggle="tooltip"
                                            data-original-title={new Date(task.open_date * 1000).toLocaleString()}
                                            className="text-gray-500"
                                        >
                                            Due since: {getDueTime(task.open_date)}
                                        </a>
                                    </div>
                                )}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
            <AnimatePresence>
                {detailsOpen && (
                    <QueryDetails refId={selectedRefId} onClose={() => setDetailsOpen(!detailsOpen)} />
                )}
        </AnimatePresence>

        </div>
    );
};

export default LeadIn;
