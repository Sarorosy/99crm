import React, { useEffect, useState, useRef } from 'react';
import flagImage from '../../../assets/flag_mark_red.png';
import axios from 'axios';
import { Hourglass, Settings } from 'lucide-react';
import $ from 'jquery';
import "select2/dist/css/select2.css";
import "select2";
import toast from 'react-hot-toast';
import { getSocket } from '../../../Socket';
const QueryInformation = ({ refId, queryInfo, queryFiles, loading, allPriority, fetchQueryDetails, fetchSocket }) => {


    const socket = getSocket();
    const [allTags, setAllTags] = useState([]);

    const [historyVisible, setHistoryVisible] = useState(false);
    const [activityData, setActivityData] = useState([]);
    const [historyloading, setHistoryLoading] = useState(false);
    const [error, setError] = useState(null);
    const selectRef = useRef(null);

    const [editingField, setEditingField] = useState(null); // To track which field is being edited
    const [updatedValue, setUpdatedValue] = useState("");
    // Close on outside click
    const popupRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setHistoryVisible(false);
            }
        };

        if (historyVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [historyVisible]);


    const fetchTags = async () => {
        try {

            const category = sessionStorage.getItem('category');  // Assuming 'id' is stored in sessionStorage
            const user_type = sessionStorage.getItem('user_type');  // Assuming 'user_type' is stored in sessionStorage

            let whereStr = '';
            if (user_type != 'admin' && category) {
                whereStr = `${category}`; // Example: "team_id IN (1, 2, 3)"
            }

            const payload = { whereStr }



            const response = await axios.post('https://99crm.phdconsulting.in/zend/99crmwebapi/api/tags', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch tags');
            }

            setAllTags(response.data.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };


    useEffect(() => {
        fetchTags();
    }, []);

    //////////////////////////////////////////////////
    useEffect(() => {
        socket.on('query_tags_updated_emit', (data) => {
            console.log("Socket data received:", data);
            if (data.query_id == refId) {
                fetchSocket();
            }
        });

        return () => {
            socket.off('query_tags_updated_emit');  // Clean up on component unmount
        };
    }, []);


    

    ///////////////////////////////////////////////////////

    const initializeSelect2 = () => {
        // Check if selectRef.current is initialized
        if (selectRef.current && !$(selectRef.current).hasClass("select2-hidden-accessible")) {
            $(selectRef.current).select2({
                placeholder: "Select Tags",
                allowClear: true,
                multiple: true,
            }).on("change", (e) => {
                const selectedValues = $(e.target).val(); // Use Select2's value retrieval method
                setUpdatedValue(selectedValues || []); // Update React state with selected values
            });

            // Set the initial value from queryInfo.tags
            if (queryInfo.tags) {
                const initialTags = queryInfo.tags.split(",");
                $(selectRef.current).val(initialTags).trigger("change");
            }
        }
    };

    // Initialize Select2 directly after rendering
    setTimeout(initializeSelect2, 0);

    const handleChange = (e) => {
        setUpdatedValue(Array.from(e.target.selectedOptions, (option) => option.value));
    };

    const fetchActivityHistory = async () => {
        try {
            setHistoryLoading(true);
            setError(null);

            const response = await axios.post(
                "https://99crm.phdconsulting.in/zend/dashboard/api/get-activity-history",
                { assign_id: refId }
            );

            if (response.data.status) {
                setActivityData(response.data.activity);
            } else {
                setActivityData([]);
            }
        } catch (err) {
            setError("Failed to fetch activity history");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleEdit = (field, value) => {
        setEditingField(field);  // Set the field that is being edited
        setUpdatedValue(value);  // Set the current value as the initial value for editing
    };

    const handleSubmit = async (field) => {

        setError(null);
        try {
            const response = await fetch("https://99crm.phdconsulting.in/zend/99crmwebapi/api/updatefieldvalues", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ref_id: refId,
                    field: field,
                    value: updatedValue,
                    user_id: sessionStorage.getItem('id'),
                    user_name: sessionStorage.getItem('name')
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log(`${field} updated successfully`);
                if (field == "tags") {
                    socket.emit("query_tags_updated", {
                        query_id: refId,
                        user_id: sessionStorage.getItem('id'),
                        tags: updatedValue.join(','),
                    });
                }

                setEditingField(null);  // Stop editing after success
                fetchQueryDetails();
                setEditingField("");
            } else {
                setError("Failed to update. Try again later.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }

    };


    const markAsInconversation = async (assign_qid, query_id) => {
        const user_id = sessionStorage.getItem("id");
        const user_name = sessionStorage.getItem("name");

        const postData = {
            assign_qid,
            query_id,
            user_id,
            user_name,
        };

        try {
            const response = await fetch("https://99crm.phdconsulting.in/zend/api/markinconversation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();
            if (result.status) {
                toast.success("Marked as In Conversation successfully!");
                fetchQueryDetails();
            } else {
                toast.error(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error marking as in conversation:", error);
            toast.error("Failed to mark as in conversation.");
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }} >
                {Array.from({ length: 20 }).map((_, index) => (
                    <div
                        key={index}
                        style={{
                            height: "15px",
                            width: "100%",
                            backgroundColor: "#e0e0e0",
                            borderRadius: "4px",
                            animation: "pulse 1.5s infinite"
                        }}
                    ></div>
                ))}
                <style>{`
                    @keyframes pulse {
                        0% { background-color: #e0e0e0; }
                        50% { background-color: #f0f0f0; }
                        100% { background-color: #e0e0e0; }
                    }
                `}</style>
            </div>
        );
    }
    const handleButtonClick = () => {
        setHistoryVisible((prev) => {
            const newValue = !prev;
            if (newValue) fetchActivityHistory();
            return newValue;
        });
    };



    if (!queryInfo) {
        return <div>No data available</div>;
    }



    return (
        <div className="query-info-container bg-white  px-8 py-4 rounded-lg shadow-lg relative">
            <div className="query-detail space-y-4">
                {[
                    { label: "Ref. No.", value: queryInfo.assign_id, editable: false },
                    { label: "Referred By", value: queryInfo.referred_by, editable: false },
                    { label: "Profile", value: queryInfo.profile_name, editable: false },
                    { label: "Name", value: queryInfo.name, editable: false },
                    { label: "Email", value: queryInfo.email_id, editable: false },
                    { label: "Alternate Email ID", value: queryInfo.alt_email_id, editfieldname: "alt_email_id", editable: (queryInfo.alt_email_id == '' || queryInfo.alt_email_id == null) ? true : false },
                    { label: "Contact No.", value: queryInfo.phone, editable: false, editfieldname: "phone" },
                    { label: "Alternate Contact No.", value: queryInfo.alt_contact_no, editable: queryInfo.alt_contact_no = '' ? true : false, editfieldname: "alt_contact_no" },
                    { label: "Address", value: queryInfo.complete_address || 'Not provided', editable: (queryInfo.complete_address == "" || queryInfo.complete_address == null) ? true : false, editfieldname: "complete_address" },
                    { label: "Topic/Area of Study", value: queryInfo.area_of_study, editable: false, editfieldname: "area_of_study" },
                    { label: "Service", value: queryInfo.service_name, editable: false },
                    { label: "Location", value: queryInfo.location, editable: false },
                    { label: "City", value: queryInfo.city, editable: false },
                    { label: "Company Name", value: queryInfo.company_name, editable: false },
                    { label: "Website", value: queryInfo.website_name, editable: false, editfieldname: "website_name" },
                    { label: "Allocated To", value: queryInfo.user_name, editable: false },
                    { label: "Manager Name", value: queryInfo.manager_name, editable: false },
                    { label: "Priority", value: queryInfo.assign_priority, editable: true, editfieldname: "assign_priority" },
                    { label: "Academic Level", value: queryInfo.academic_level, editable: false },
                    { label: "Follow Up Date", value: new Date(queryInfo.follow_up_date * 1000).toLocaleDateString(), editable: false },
                    { label: "Query Created Date", value: new Date(queryInfo.created_on * 1000).toLocaleString(), editable: false },
                ].map(({ label, value, editable, editfieldname }, index) => (
                    <div className="flex justify-between" key={index}>
                        <div className='w-1/2 text-left'>
                            <strong>{label}</strong>
                        </div>
                        <div className='w-1/2 text-left flex items-center'>
                            {editingField === editfieldname ? (
                                <>
                                    {(editfieldname == "assign_priority") ? (
                                        <select
                                            value={updatedValue}
                                            onChange={(e) => setUpdatedValue(e.target.value)}
                                            className="border p-1 rounded"
                                        >
                                            {allPriority.map((priority) => (
                                                <option key={priority.id} value={priority.priority}>
                                                    {priority.priority}
                                                </option>
                                            ))}
                                        </select>
                                    ) : editfieldname === "tags" ? (
                                        <select
                                            multiple
                                            value={updatedValue}
                                            onChange={(e) =>
                                                setUpdatedValue(
                                                    Array.from(e.target.selectedOptions, (option) => option.value)
                                                )
                                            }
                                            className="border p-1 rounded"
                                        >
                                            {allTags.map((tag) => (
                                                <option key={tag.id} value={tag.name}>
                                                    {tag.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={updatedValue}
                                            onChange={(e) => setUpdatedValue(e.target.value)}
                                            className="border p-1 rounded"
                                        />
                                    )}

                                    <button
                                        onClick={() => handleSubmit(editfieldname)}
                                        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                                        style={{ fontSize: "12px" }}
                                    >
                                        {loading ? "Submitting..." : "Submit"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>{value || "Not provided"}</span>
                                    {editable && (
                                        <button
                                            onClick={() => handleEdit(editfieldname, value)}
                                            style={{
                                                marginLeft: "8px",
                                                border: "none",
                                                background: "transparent",
                                                cursor: "pointer",
                                                color: "#0a5eb0",
                                                fontSize: "16px",
                                            }}
                                            title={`Edit ${label}`}
                                        >
                                            <Settings size={14} />
                                        </button>
                                    )}
                                </>
                            )}
                            {label === "Ref. No." && (
                                <button
                                    ref={buttonRef}
                                    onClick={() => handleButtonClick()}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        color: "#0a5eb0",
                                        fontSize: "16px",
                                    }}
                                    title='Earlier Activity History'
                                >
                                    <Hourglass className='ml-2' size={14} />
                                </button>
                            )}
                        </div>
                        {historyVisible && (
                            <div
                                ref={popupRef}
                                className="absolute histqd bg-white rounded-md border p-2 z-50 overflow-y-auto custom-scrollbar fsx "
                            >
                                {historyloading && (
                                    <div className="space-y-3 animate-pulse">
                                        <div className="h-4 bg-gray-300 rounded"></div>
                                        <div className="h-4 bg-gray-300 rounded"></div>
                                        <div className="h-4 bg-gray-300 rounded"></div>
                                    </div>
                                )}

                                {error && <p className="text-red-500 text-sm">{error}</p>}

                                {!historyloading && !error && activityData.length === 0 && (
                                    <p className="text-gray-500 text-sm">No activity found</p>
                                )}

                                {!historyloading &&
                                    activityData.map((activity, index) => (
                                        <div
                                            key={index}
                                            className="mb-1 border-b border-gray-100 pb-1 last:border-b-0"
                                        >
                                            <p className="font-semibold text-green-600">{activity.user_name}&nbsp;{activity.message}</p>
                                            {/* <p className="text-gray-600 ">{activity.message}</p> */}
                                            <p className="text-gray-400 fssx">{activity.action_date}</p>
                                        </div>
                                    ))}
                            </div>
                        )}

                    </div>
                ))}


                {queryInfo.ifCampTag && queryInfo.ifCampTag == 1 && (
                    <div className="flex justify-start">
                        <div className='w-1/2 text-left'>
                            <strong>Camp Tag</strong>
                        </div>
                        <div className=' text-center' style={{ width: " 80px" }}>
                            <div className='bg-green-100 px-1 py-1 rounded'>Yes</div>
                        </div>
                    </div>
                )}
                {/* Tags */}
                <div className="flex justify-between">
                    <div className='w-1/2 text-left'>
                        <strong>Tags</strong>
                    </div>
                    <div className='w-1/2 text-left'>
                        <div class="d-flex align-items-start">
                            {editingField && editingField === "tags" ? (
                                <div>
                                    <select
                                        ref={selectRef}
                                        multiple
                                        value={updatedValue}
                                        style={{ visibility: editingField == "tags" ? "" : "hidden" }}
                                        onChange={(e) =>
                                            setUpdatedValue(
                                                Array.from(e.target.selectedOptions, (option) => option.value)
                                            )
                                        }
                                        className={`border p-1 rounded `}
                                    >
                                        {allTags.map((tag) => (
                                            <option key={tag.id} value={tag.id}>
                                                {tag.tag_name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleSubmit("tags")}
                                        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                                        style={{ fontSize: "12px" }}
                                    >
                                        {loading ? "Submitting..." : "Submit"}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <ul className="space-y-1" style={{ display: editingField === "tags" ? "none !important" : "block !important" }}>
                                        {queryInfo.arrTags && queryInfo.arrTags.length > 0 ? (
                                            queryInfo.arrTags.map((tag, index) => (
                                                <li key={index} className="text-blue-500">{tag}</li>
                                            ))
                                        ) : (
                                            <p>No tags available</p>
                                        )}
                                    </ul>
                                    <button
                                        onClick={() => handleEdit("tags", queryInfo.tags)}
                                        style={{
                                            marginLeft: "8px",
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                            color: "#0a5eb0",
                                            fontSize: "16px",

                                        }}
                                        title={`Edit Tags`}
                                    >
                                        <Settings size={14} />
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>


                {/* Requirement */}
                <div className="flex justify-between">
                    <div className='w-1/2 text-left'>
                        <strong>Requirement</strong>
                    </div>
                    <div className='w-1/2 text-left'>
                        {queryInfo.line_format ? (
                            <div className="prose" dangerouslySetInnerHTML={{ __html: queryInfo.line_format }} />
                        ) : queryInfo.paragraph_format ? (
                            <div>{queryInfo.paragraph_format}</div>
                        ) : (
                            <div>No Requirement Available</div>
                        )}
                    </div>
                </div>

                {/* Remarks */}
                {queryInfo.remarks && (
                    <div className="flex justify-between">
                        <div className='w-1/2 text-left'>
                            <strong>Remarks</strong>
                        </div>
                        <div className='w-1/2 text-left'>
                            <span>{queryInfo.remarks}</span>
                        </div>
                    </div>
                )}

                {/* Flagmark */}
                {queryInfo.flag_mark === 'on' && (
                    <div className="flex justify-between">
                        <div className='w-1/2 text-left'>
                            <strong>Flagmark</strong> </div>
                        <div className='w-1/2 text-left'><img src={flagImage} alt="Flag" className="w-8 h-8" /> </div>
                    </div>
                )}

                {/* Files */}
                <div className="flex justify-between">
                    <div className='w-1/2 text-left'>
                        <strong>Uploaded Files</strong>
                    </div>
                    <div className='w-1/2 text-left'>
                        {queryFiles && queryFiles.length > 0 ? (
                            <ul className="space-y-1">
                                {queryFiles.map((file, index) => (
                                    <li key={index}>
                                        <a href={`https://99crm.phdconsulting.in/${file.file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                            {file.file_name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span>No Files</span>
                        )}
                    </div>
                </div>

                {/* Query Status */}
                <div className="flex justify-between">
                    <div className='w-1/2 text-left'>
                        <strong>Query Status</strong>
                    </div>
                    <div className='w-1/2 text-left'>
                        {queryInfo.status === 1 ? (
                            <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Lead In</span>
                        ) : queryInfo.status === 2 ? (
                            <span className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">Contact Made</span>
                        ) : queryInfo.status === 3 ? (
                            <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Quoted</span>
                        ) : queryInfo.status === 4 ? (
                            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full">Negotiating</span>
                        ) : queryInfo.status === 5 ? (
                            <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full">Converted</span>
                        ) : queryInfo.status === 6 ? (
                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full">Client Not Interested</span>
                        ) : queryInfo.status === 7 ? (
                            <span className="bg-teal-200 text-teal-800 px-2 py-1 rounded-full">Reminder</span>
                        ) : queryInfo.status === 8 ? (
                            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full">Lost Deals</span>
                        ) : null}
                    </div>
                </div>
                {sessionStorage.getItem('user_type') === 'user' &&
                    (!queryInfo.inConversationMarkExpiry || queryInfo.inConversationMarkExpiry < Math.floor(Date.now() / 1000)) ? (
                    <div className="flex justify-between">
                        <div className='w-1/2 text-left'>
                            <strong>Mark As In Conversation</strong>
                        </div>
                        <div className='w-1/2 text-left'>
                            <button
                                onClick={() => markAsInconversation(queryInfo.assign_id, queryInfo.id)}
                                className='bg-green-600 text-white px-1 py-0.5 rounded'
                            >
                                In Conversation
                            </button>
                        </div>
                    </div>
                ) : null}


            </div>
        </div>


    );
};

export default QueryInformation;
