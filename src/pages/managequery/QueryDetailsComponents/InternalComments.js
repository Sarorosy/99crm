import { X , History} from "lucide-react";
import React, { useState } from "react";

const InternalComments = ({ internalCommentsData }) => {
    const [activeComment, setActiveComment] = useState(null);

    if (!internalCommentsData || internalCommentsData.length === 0) {
        return <p>No internal comments available.</p>;
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
        <div className="space-y-4 col-md-5 relative">
            {internalCommentsData.map((comment) => (
                <div
                    key={comment.id}
                    className="p-4 bg-gray-100 rounded-lg shadow-sm border border-gray-300 relative"
                >
                    <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">From: </span>
                        <span
                            className="text-blue-600 cursor-pointer"
                            onClick={() => setActiveComment(activeComment === comment.id ? null : comment.id)}
                        >
                            {comment.FromName}
                        </span>
                    </p>
                    <p className="flex items-center">
                        <span className="font-medium "><History className="text-orange-400" size={18} /></span>{" "}
                        {formatDate(comment.date)}
                    </p>
                    </div>

                    {comment.comments && (
                        <p className="mt-2 text-gray-700">
                            <span className="font-medium">Comments:</span> {comment.comments}
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
                    {comment.date && (
                        <div className="mt-2 text-gray-600 flex justify-between items-center">
                            <span
                                className="tooltip"
                                title={new Date(comment.date * 1000).toLocaleString()}
                            >
                                {formatDate(comment.date)}
                            </span>
                        </div>
                    )}
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
                        <div className="absolute bg-white border border-gray-300 p-4 rounded-lg shadow-lg top-0 left-0 z-10">
                            <button
                                className="mt-2 px-2 py-1 text-white bg-red-500 rounded-full hover:bg-red-600 float-right"
                                onClick={() => setActiveComment(null)}
                            >
                                <X size={18} />
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
