import React, { useEffect, useState } from 'react';
import flagImage from '../../../assets/flag_mark_red.png';

const QueryInformation = ({ refId }) => {
    const [queryInfo, setQueryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [activityData, setActivityData] = useState([]);

    useEffect(() => {
        const fetchQueryDetails = async () => {
            const id = sessionStorage.getItem('id');
            const category = sessionStorage.getItem('category');

            const payload = {
                query_id: refId,
                category: category,
                user_id: id
            };

            try {
                const response = await fetch('https://99crm.phdconsulting.in/api/queryDetails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                setQueryInfo(data.queryInfo);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching query details:', error);
                setLoading(false);
            }
        };

        fetchQueryDetails();
    }, []);

    
    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }} className='col-md-5'>
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
    

    if (!queryInfo) {
        return <div>No data available</div>;
    }

    return (
        <div className="query-info-container bg-white col-md-5 px-8 py-2 rounded-lg shadow-lg">
            <div className="query-detail space-y-4">
                {[
                    { label: "Ref. No.", value: queryInfo.assign_id },
                    { label: "Referred By", value: queryInfo.referred_by },
                    { label: "Profile", value: queryInfo.profile_name },
                    { label: "Name", value: queryInfo.name },
                    { label: "Email", value: queryInfo.email_id },
                    { label: "Alternate Email ID", value: queryInfo.alt_email_id },
                    { label: "Contact No.", value: queryInfo.phone },
                    { label: "Alternate Contact No.", value: queryInfo.alt_contact_no },
                    { label: "Address", value: queryInfo.complete_address || 'Not provided' },
                    { label: "Topic/Area of Study", value: queryInfo.area_of_study },
                    { label: "Service", value: queryInfo.service_name },
                    { label: "Location", value: queryInfo.location },
                    { label: "City", value: queryInfo.city },
                    { label: "Company Name", value: queryInfo.company_name },
                    { label: "Website", value: queryInfo.website_name },
                    { label: "Allocated To", value: queryInfo.user_name },
                    { label: "Manager Name", value: queryInfo.manager_name },
                    { label: "Priority", value: queryInfo.assign_priority },
                    { label: "Academic Level", value: queryInfo.academic_level },
                    { label: "Follow Up Date", value: new Date(queryInfo.follow_up_date * 1000).toLocaleDateString() },
                    { label: "Query Created Date", value: new Date(queryInfo.created_on * 1000).toLocaleString() },
                ].map(({ label, value }, index) => (
                    <div className="flex justify-between" key={index}>
                        <div className='w-1/2 text-left'>
                            <strong>{label}</strong>
                        </div>
                        <div className='w-1/2 text-left'>
                            <span>{value || "Not provided"}</span>
                        </div>
                    </div>
                ))}

                {/* Tags */}
                <div className="flex justify-between">
                    <div className='w-1/2 text-left'>
                        <strong>Tags</strong>
                    </div>
                    <div className='w-1/2 text-left'>
                        <ul className="space-y-1">
                            {queryInfo.arrTags && queryInfo.arrTags.length > 0 ? (
                                queryInfo.arrTags.map((tag, index) => (
                                    <li key={index} className="text-blue-500">{tag}</li>
                                ))
                            ) : (
                                <p>No tags available</p>
                            )}
                        </ul>
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
                        {queryInfo.files && queryInfo.files.length > 0 ? (
                            <ul className="space-y-1">
                                {queryInfo.files.map((file, index) => (
                                    <li key={index}>
                                        <a href={`https://99crm.phdconsulting.com/${file.file_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">
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
            </div>
        </div>


    );
};

export default QueryInformation;
