import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import moment from 'moment'; // To format the time as "X ago"
import { CircleX } from 'lucide-react';
import toast from 'react-hot-toast';

const CommentDiv = ({ commentInfo, onClose, assignId }) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false); // State to toggle visibility of the floating div
    const [unArchiveData, setUnArchiveData] = useState({});
    const [archiveData, setArchiveData] = useState({});
    const userType = sessionStorage.getItem('user_type');
    const [commentData, setCommentData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading..Please wait');

    const getProfilePicInitials = (name) => {
        const firstName = name.split(' ')[0]; // Get the first word of the name
        return firstName.charAt(0).toUpperCase(); // Return the first letter
    };

    const handleAdminClick = () => {
        setIsDetailsVisible(!isDetailsVisible); // Toggle the floating div visibility on admin name click
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://99crm.phdconsulting.in/api/getcommentsarchivetabs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ assign_id: assignId }),
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                if (data.status) {
                    setUnArchiveData(data.UnArchiveData || {}); // Default to empty object if undefined
                    setArchiveData(data.ArchiveData || {}); // Default to empty object if undefined
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        if (assignId) {
            fetchData();
        }
    }, [assignId]); // Run effect when assignId changes
    
    const saveCommentsArchive = async (assignId) => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/api/savecommentsarchive', {
                method: 'POST',
                body: JSON.stringify({ assign_id: assignId })});
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status) {
                toast.success('Comments archived successfully!');
                setCommentData(data.CommentInfo);
            }
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const getArchiveComments = async (archiveNo) => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/api/getquerycomments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ assign_qid: assignId, archive_no: archiveNo }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status) {
                console.log(data);
                setCommentData(data.CommentInfo);
                if(data.CommentInfo.length == 0){
                    setLoadingMessage('No comments available!');
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        getArchiveComments(0);
    }, []);
    

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 relative col-md-12 mt-3">
            <button
                onClick={onClose}
                className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
            >
                <CircleX size={32} />
            </button>
            
            <h2 className="text-lg font-semibold">Previous Comments</h2>

            <div className="row">
            {/* Archive Tabs Section */}
            <div className="col-md-10">
                {archiveData.length > 0 && (
                    <ul className="nav nav-tabs tab-scetion">
                        {archiveData.map((data) => (
                            <li key={data.archive_no} id={`archiveList${data.archive_no}`}>
                                <button
                                    style={{ color: "#444", borderRadius: "0" }}
                                    data-toggle="tab"
                                    className='btn btn-warning btn-sm'
                                    onClick={() => getArchiveComments(data.archive_no)}
                                >
                                    Archive {data.archive_no}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Save Archive Button Section */}
            <div className="col-md-2">
                {userType == "user" && unArchiveData.length > 0 && (
                    <button
                        style={{
                            margin: "0px",
                            padding: "2px",
                            fontSize: "11px",
                            float: "right",
                        }}
                        type="button"
                        className="btn btn-primary btn-sm"
                         onClick={() => saveCommentsArchive(assignId)}
                    >
                        Save Archive
                    </button>
                )}
            </div>
        </div>

            {commentData.length > 0 ? (
                commentData.map((comment) => (
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
                <p className={`alert ${loading ? 'alert-warning' : 'alert-danger'} mt-4 text-center`}>{loadingMessage}</p>
            )}
        </div>
    );
};

export default CommentDiv;
