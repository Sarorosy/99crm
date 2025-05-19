import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSocket } from "../../../Socket";

const ShowHoldQuery = ({ queryInfo, finalFunction }) => {
    const socket = getSocket();
    const [allocatedTo, setAllocatedTo] = useState("");
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});
    const [activeCrmUsers, setActiveCrmUsers] = useState([]);

    useEffect(() => {
        fetchActiveCrms();
    },[])
    if (!queryInfo) {
        return <span className="text-red">Query not found.</span>;
    }

    const handleAssign = async () => {
        let hasError = false;
        const newError = {};

        if (queryInfo.hold_query == 3 && !comments) {
            newError.comments = "Please enter comments.";
            hasError = true;
        }

        if (queryInfo.hold_query == 1 && !allocatedTo) {
            newError.allocated_to = "Please select a user.";
            hasError = true;
        }

        setError(newError);
        if (hasError) return;

        if (!window.confirm("Are you sure? You want to assign?")) return;

        setLoading(true);

        try {
            const formData = {
                assign_id: queryInfo.assign_id,
                action_type:
                    queryInfo.hold_query == 1 || queryInfo.hold_query == 3
                        ? "assign_to_crm"
                        : "assign_to_ops",
                website_id: queryInfo.website_id,
                website: queryInfo.website_id,
                comments,
                allocated_to: allocatedTo,
                user_id: sessionStorage.getItem("id"),
                user_name: sessionStorage.getItem("name"),
            };

            if (queryInfo.hold_query == 3) {
                const response = await fetch(
                    "https://99crm.phdconsulting.in/zend/api/again-assign-hold-query",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    }
                );
                const result = await response.json();

                if (result.status) {
                    toast.success("Assigned successfully!");
                    socket.emit("query_hold_updated", {
                        query_id: queryInfo.assign_id,
                        given_back : "yes"
                    });
                    finalFunction();
                    // You can do a redirect or refetch logic here
                } else {
                    toast.error(result.message || "Something went wrong.");
                }

            } else {
                const response = await fetch(
                    "https://99crm.phdconsulting.in/zend/api/assign-hold-query",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    }
                );
                const result = await response.json();

                if (result.status) {
                    toast.success("Assigned successfully!");
                    socket.emit("query_hold_updated", {
                        query_id: queryInfo.assign_id,
                        given_back : "no"
                    });
                    finalFunction();
                    // You can do a redirect or refetch logic here
                } else {
                    toast.error(result.message || "Something went wrong.");
                }
            }

        } catch (e) {
            console.error(e);
            console.log("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const fetchActiveCrms = async () => {
        try{
            const response = await fetch("https://99crm.phdconsulting.in/zend/api/fetchactivecrms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ref_id: queryInfo.assign_id,}
                )
            })
            const result = await response.json();   
            if(result.status){
                setActiveCrmUsers(result.ActiveCrmUsers);
            }
        }catch(e){
            console.error(e);
        }
    }

    

    
    return (
        <div className="bg-light p-3" id="activityHistoryArea">
            <div className="border-b pb-2 mb-3">
                <h2 className="text-lg font-semibold text-black-800">Assign Hold Query</h2>
            </div>

            <div className="space-y-2">
                <div>
                    <h4 className="font-bold text-black-900 mb-3 text-md">Query Details</h4>
                    <div className="text-sm text-gray-700 flex flex-column gap-2">
                        <p><span className="font-semibold">Reference Id :</span> {queryInfo.assign_id}</p>
                        <p><span className="font-semibold">Name :</span> {queryInfo.name}</p>
                        <p><span className="font-semibold">Email :</span> {queryInfo.email_id}</p>
                        <p><span className="font-semibold">Phone :</span> {queryInfo.phone}</p>
                        <p><span className="font-semibold">Company Name :</span> {queryInfo.company_name}</p>
                        <p><span className="font-semibold">Website ID :</span> {queryInfo.website_name}</p>
                        <p><span className="font-semibold">Service Name :</span> {queryInfo.service_name}</p>

                        {queryInfo.hold_query == 3 && queryInfo.hold_user && (
                            <>
                                <p><span className="font-semibold">Assigned User:</span> {queryInfo.hold_user.name}</p>
                                <p><span className="font-semibold">Assigned User Profile:</span> {queryInfo.hold_user.profile_name}</p>
                            </>
                        )}
                    </div>
                </div>

                {queryInfo.hold_query == 3 ? (
                    <div className="sm:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md p-2 h-28 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Write a comment..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                        {error.comments && <span className="text-red-600 text-sm">{error.comments}</span>}
                    </div>
                ) : (
                    queryInfo.hold_query == 1 && (
                        <div className="sm:w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Allocated To</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={allocatedTo}
                                onChange={(e) => setAllocatedTo(e.target.value)}
                            >
                                <option value="">Please Select</option>
                                {activeCrmUsers && activeCrmUsers.map((user) => (
                                    <option key={user.user_id} value={user.user_id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                            {error.allocated_to && (
                                <span className="text-red-600 text-sm">{error.allocated_to}</span>
                            )}
                        </div>
                    )
                )}

                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        className={`btn btn-sm text-[#006c81] ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#cfe1e5]  border border-[#006c81]"
                            }`}
                        onClick={handleAssign}
                        disabled={loading}
                    >
                        {queryInfo.hold_query == 1
                            ? "Assign to CRM"
                            : queryInfo.hold_query == 3
                                ? "Assign Back to CRM"
                                : "Assign to OPS"}
                    </button>

                    {loading && (
                        <input
                            className="px-4 py-2 rounded-md bg-blue-400 text-white cursor-wait"
                            value="Please Wait..."
                            type="button"
                            disabled
                        />
                    )}
                </div>
            </div>
        </div>

    );
};

export default ShowHoldQuery;
