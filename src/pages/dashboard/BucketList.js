import { Bell, Calendar } from 'lucide-react';
import React from 'react';
import SkeletonLoader from './SkeletonLoader';
import { AnimatePresence } from 'framer-motion';
import QueryDetails from '../managequery/QueryDetails';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip'

const BucketList = ({ queries, loading, fetchDashboardQueriesForSocket }) => {

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedRefId, setSelectedRefId] = useState('');

    const getDueTime = (timestamp) => {
        const currentDate = new Date();
        const dueDate = new Date(parseInt(timestamp) * 1000);
        const diffInSeconds = Math.floor((currentDate - dueDate) / 1000);
    
        const secondsInMinute = 60;
        const secondsInHour = 60 * secondsInMinute;
        const secondsInDay = 24 * secondsInHour;
        const secondsInMonth = 30 * secondsInDay;
        const secondsInYear = 12 * secondsInMonth;
    
        if (diffInSeconds >= secondsInYear) {
            return `${Math.floor(diffInSeconds / secondsInYear)} Year(s) ago`;
        } else if (diffInSeconds >= secondsInMonth) {
            return `${Math.floor(diffInSeconds / secondsInMonth)} Month(s) ago`;
        } else if (diffInSeconds >= secondsInDay) {
            return `${Math.floor(diffInSeconds / secondsInDay)} Day(s) ago`;
        } else if (diffInSeconds >= secondsInHour) {
            return `${Math.floor(diffInSeconds / secondsInHour)} Hour(s) ago`;
        } else if (diffInSeconds >= secondsInMinute) {
            return `${Math.floor(diffInSeconds / secondsInMinute)} Minute(s) ago`;
        } else {
            return "Just now";
        }
    };
    

    const getStatusLabel = (status) => {
        switch (status) {
            case 1: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal bradius px-1 py-0 pull-right">Lead In</span>;
            case 2: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal bradius px-1 py-0  pull-right">Contact Made</span>;
            case 3: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal bradius px-1 py-0  pull-right">Quoted</span>;
            case 4: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal bradius px-1 py-0  pull-right">Negotiating</span>;
            case 5: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal bradius px-1 py-0  pull-right">Converted</span>;
            case 6: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal bradius px-1 py-0 pull-right">Client Not Interested</span>;
            case 7: return <span style={{fontSize:"9px"}} className="bg-blue-950 text-white font-normal bradius px-1 py-0 pull-right">Reminder</span>;
            default: return null;
        }
    };
    const handleViewButtonClick = (data) => {
        setSelectedRefId(data.assign_id);
        setDetailsOpen(true);
    }


    return (
        <div className="open-tasks-container" style={{ padding: '20px 8px', border: '0px solid #ddd', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff6db', maxWidth: '350px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#02313a', marginBottom: '15px' }}>Bucket List <span className='text-green-600 bg-transparent rouneded-full px-1 py-1'>({queries && queries.length})</span></h1>
            <ul className=" custom-scrollbar box-height h-96 overflow-y-scroll" id="sortable3">
                {loading ? <SkeletonLoader /> : queries.map((task) => (
                    <li
                        key={task.assign_id}
                        id={task.assign_id}
                        className={`itemborder border-gray-300 rounded-sm mb-2 px-2 py-1 shadow-md text-sm cursor-pointer `}
                        style={{backgroundColor :task.color_code ?? "white"}}
                        onClick={() => handleViewButtonClick(task)} // Replace with your actual function
                    >
                        <div className="product-info">
                            <a
                                href="javascript:void(0)"
                                className="font-bold text-blue-950 "
                                data-tooltip-id="my-tooltip" data-tooltip-content={task.email_id}
                            >
                                {getStatusLabel(task.update_status)}
                                <p className='flex items-center fss'>
                                {task.name}
                                {task.showBellicon == 1 ? (
                                    <Bell size={12} className="text-red-500 mr-1 mt-1" />
                                ) : (
                                    ""
                                )}
                                {task.reconnect_date && new Date(task.reconnect_date * 1000) >= new Date() && (
                                    <Calendar size={12} className="mr-1 mt-1" />
                                )}

                                </p>
                            </a>
                            <span className="product-description text-gray-600  block">
                                Ref. No. : {task.assign_id}
                                {task.open_date && task.open_status == '0' && (
                                    <div className="timerCls">
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
                                {task.update_status == 7 && task.remainder_date && (
                                    <div className="timerCls">
                                        <a
                                            href="javascript:void(0)"
                                            data-placement="bottom"
                                            data-toggle="tooltip"
                                            data-original-title={new Date(task.remainder_date * 1000).toLocaleString()}
                                            className="text-gray-500"
                                        >
                                            Due since: {getDueTime(task.remainder_date)}
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
                    <QueryDetails refId={selectedRefId} onClose={() => setDetailsOpen(!detailsOpen)} fetchDashboardQueriesForSocket={fetchDashboardQueriesForSocket}/>
                )}
        </AnimatePresence>
        <Tooltip id="my-tooltip" />
        </div>
    );
};

export default BucketList;
