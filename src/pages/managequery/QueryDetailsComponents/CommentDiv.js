import React, { useState } from 'react';
import { X } from 'lucide-react';
import moment from 'moment'; // To format the time as "X ago"
import { CircleX } from 'lucide-react';

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
        <div className="bg-white rounded-lg shadow-lg p-4 relative col-md-12 mt-3">
            <button
                onClick={onClose}
                className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
            >
                <CircleX size={32} />
            </button>
            
            <h2 className="text-lg font-semibold">Previous Comments</h2>

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
                                    onClick={() => { setIsDetailsVisible(!isDetailsVisible) }}
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
        </div>
    );
};

export default CommentDiv;
