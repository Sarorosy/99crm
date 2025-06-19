import { Frown } from "lucide-react";
import React from "react";
import { Tooltip } from "react-tooltip";

const CampaignComments = ({ campaginCommentData }) => {
    if (!campaginCommentData || campaginCommentData.length === 0) {
        return <p className=' col-md-12 text-center bg-blue-100 px-2 py-2 flex items-center justify-center mt-3 f-13'>No comments available. <Frown className='' size={18} /></p>;
    }

    return (
        <div className="space-y-6 p-4 bg-white rounded-lg shadow-md col-md-5">
            {campaginCommentData.map((comment) => (
                <div
                    key={comment.id}
                    className="py-2 px-2 bg-gray-100 rounded-lg shadow-sm border border-gray-300 flex items-start space-x-4"
                >
                    {/* Profile Circle */}
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {comment.username.charAt(0)}
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1">
                        <div className="mb-1">
                            <p className="text-lg font-semibold text-gray-700">{comment.username}</p>
                        </div>
                        <p className="text-sm text-gray-800">
                            {comment.comments}
                        </p>
                        <div className=" text-right">
                            <span
                                className="text-xs text-gray-500 italic "
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content={new Date(Number(comment.dates) * 1000).toLocaleString()}
                            >
                                {Math.floor(
                                    (Date.now() - Number(comment.dates) * 1000) / (1000 * 60 * 60 * 24)
                                )}{" "}
                                days ago
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            <Tooltip id="my-tooltip" />
        </div>
    );
};

export default CampaignComments;
