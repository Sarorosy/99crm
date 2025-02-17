import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import moment from 'moment'; // To format the time as "X ago"

const CommentDiv = ({ commentInfo, onClose }) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false); // State to toggle visibility of the floating div

    const getProfilePicInitials = (name) => {
        const firstName = name.split(' ')[0]; // Get the first word of the name
        return firstName.charAt(0).toUpperCase(); // Return the first letter
    };

    const handleAdminClick = () => {
        setIsDetailsVisible(!isDetailsVisible); // Toggle the floating div visibility on admin name click
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-6"
        >
            <div className="flex px-5 items-center justify-between space-x-10 theme py-3 rounded-t-lg">
                <h2 className="text-lg font-semibold">Previous Comments</h2>
                <button
                    onClick={onClose}
                    className="text-white flex items-center hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                    <X size={14} />
                </button>
            </div>

            {commentInfo.length > 0 ? (
                commentInfo.map((comment) => (
                    <div key={comment.id} className="border-b p-4 mb-4 bg-gray-50 rounded-md relative">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                                {getProfilePicInitials(comment.FromName)}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{comment.subject}</h3>
                                <p
                                    onClick={handleAdminClick} // Add onClick handler for the admin name
                                    className="text-sm text-blue-500 cursor-pointer"
                                >
                                    From: {comment.FromName}
                                </p>
                            </div>
                            <div className="ml-auto text-sm text-gray-500">
                                {moment.unix(comment.date).fromNow()} {/* Format the time */}
                            </div>
                        </div>

                        <div
                            className="mt-4"
                            dangerouslySetInnerHTML={{ __html: comment.email_body }}
                        />


                        {isDetailsVisible && (
                            <div style={{fontSize:"12px"}} className="absolute top-12 left-0 bg-white shadow-md rounded-lg p-4 mt-4 w-lg border">
                                <button
                                    onClick={()=>{setIsDetailsVisible(!isDetailsVisible)}}
                                    className="text-white flex items-center hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500 float-right"
                                >
                                    <X size={15} />
                                </button>
                                <p className="font-semibold">From: <span className='font-normal'>{comment.from_email}</span></p>
                                <p className="font-semibold">To: <span className='font-normal'>{comment.to_email}</span></p>
                                <p className="font-semibold">Date: <span className='font-normal'>{moment.unix(comment.date).format('MMM DD, YYYY, hh:mm A')}</span></p>
                                <p className="font-semibold">Subject: <span className='font-normal'>{comment.subject}</span></p>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p className='alert alert-danger mt-4 text-center'>No comments available.</p>
            )}
        </motion.div>
    );
};

export default CommentDiv;
