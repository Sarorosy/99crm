import { X, History, Frown } from "lucide-react";
import React, { useState } from "react";

const InternalComments = ({ internalCommentsData }) => {
    const [activeComment, setActiveComment] = useState(null);

    if (!internalCommentsData || internalCommentsData.length === 0) {
        return <p className='text-center  bg-blue-100 px-2 py-2 flex items-center justify-center'>No internal comments available. <Frown className='' size={18} /></p>;
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = now - date;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
        if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
        if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        return "Just now";
    };

    return (
        <div className="space-y-4 relative mt-1 p-2">
            {internalCommentsData.map((comment) => (
                <div
                    key={comment.id}
                    className="bg-white p-2 f-12 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                        {comment.FromName && (
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">From: </span>
                                <span
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() => setActiveComment(activeComment === comment.id ? null : comment.id)}
                                >
                                    {comment.FromName}
                                </span>
                            </p>
                        )}
                        {comment.comments && (
                            <p className="text-gray-700">
                                <span className="font-medium">Comments:</span> 
                                
                            </p>
                        )}
                        
                    </div>
                    <p className="flex items-center justify-end">
                        <span className="font-medium "><History className="text-orange-400 me-1" size={14} /></span>{" "}
                        <span 
                            className="tooltip text-black  f-11"
                            style={{ opacity: "1" }}
                            title={new Date(comment.date * 1000).toLocaleString()}
                        >
                            {formatDate(comment.date)}
                        </span>
                    </p>
                    </div>

                    {comment.comments && (
                        <p className="mt-2 text-gray-700">
                            {/* <span className="font-medium">Comments:</span>  */}
                            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                <div dangerouslySetInnerHTML={{ __html: comment.comments }} />
                            </div>
                        </p>
                    )}
                    {comment.email_body && (
                        <div className="mt-2 text-gray-700">
                            <span className="font-medium">Email Body:</span>
                            <div
                                className="mt-1"
                                dangerouslySetInnerHTML={{ __html: comment.email_body }}
                            />
                        </div>
                    )}
                    {/* {comment.date && (
                        <div className="mt-2 text-gray-600 flex justify-between items-center">
                            <span
                                className="tooltip"
                                title={new Date(comment.date * 1000).toLocaleString()}
                            >
                                {formatDate(comment.date)}
                            </span>
                        </div>
                    )} */}
                    {comment.call_message != "" && (
                        <div className="mt-2 text-gray-700">
                            <span className="font-medium">Call Message:</span>
                            <div
                                className="mt-1"
                                dangerouslySetInnerHTML={{ __html: comment.call_message }}
                            />
                        </div>
                    )}
                    {comment.meeting_message != "" && (
                        <div className="mt-2 text-gray-700">
                            <span className="font-medium">Meeting Message:</span>
                            <div
                                className="mt-1"
                                dangerouslySetInnerHTML={{ __html: comment.meeting_message }}
                            />
                        </div>
                    )}

                    {/* Floating Details Box */}
                    {activeComment === comment.id && (
                        <div className="absolute bg-white border border-gray-300 p-2 rounded-lg shadow-lg top-0 left-0 z-10">
                            <button
                                className="mt-0 px-1 py-1 text-white bg-red-500 rounded-full hover:bg-red-600 float-right"
                                onClick={() => setActiveComment(null)}
                            >
                                <X size={14} />
                            </button>
                            <p>
                                <span className="font-medium">From:</span> {comment.FromName} {"<"}
                                {comment.from_email}
                                {">"}
                            </p>
                            <p>
                                <span className="font-medium">To:</span> {comment.to_email}
                            </p>
                            <p>
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(Number(comment.date) * 1000).toLocaleString()}
                            </p>

                            <p>
                                <span className="font-medium">Subject:</span> {comment.subject}
                            </p>

                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InternalComments;
