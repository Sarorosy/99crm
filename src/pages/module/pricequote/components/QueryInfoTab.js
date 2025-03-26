import React from "react";

const QueryInfoTab = ({ QueryInfo, expandStatus }) => {
    return (
        QueryInfo && (
            <div className="space-y-2 text-sm text-gray-700 bg-blue-50 p-2 rounded-lg shadow-md thirteenpx">
                {expandStatus ? (
                    // Expanded View - 3 Columns
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center justify-start">
                            <label className="font-semibold text-gray-900">Ref No.</label>
                            <div className="px-2 py-0.5 bg-blue-100 rounded ml-2">{QueryInfo.assign_id}</div>
                        </div>

                        <div className="flex items-center justify-start">
                            <label className="font-semibold text-gray-900">Client Name</label>
                            <div className="px-2 py-0.5 bg-blue-100 rounded ml-2">{QueryInfo.name}</div>
                        </div>

                        <div className="flex items-center justify-start">
                            <label className="font-semibold text-gray-900">Email Id</label>
                            <div className="px-2 py-0.5 bg-blue-100 rounded ml-2">{QueryInfo.email_id}</div>
                        </div>
                    </div>
                ) : (
                    // Collapsed View - 2 Columns
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <label className="w-1/3 font-semibold text-gray-900">Ref No.</label>
                            <div className="w-2/3 px-2 py-0.5 bg-blue-100 rounded">{QueryInfo.assign_id}</div>
                        </div>

                        <div className="flex items-center">
                            <label className="w-1/3 font-semibold text-gray-900">Client Name</label>
                            <div className="w-2/3 px-2 py-0.5 bg-blue-100 rounded">{QueryInfo.name}</div>
                        </div>

                        <div className="flex items-center">
                            <label className="w-1/3 font-semibold text-gray-900">Email Id</label>
                            <div className="w-2/3 px-2 py-0.5 bg-blue-100 rounded">{QueryInfo.email_id}</div>
                        </div>
                    </div>
                )}
            </div>
        )
    );
};

export default QueryInfoTab;