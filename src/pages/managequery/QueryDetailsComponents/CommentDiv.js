import React, { useState, useEffect } from 'react';
import { Archive, X } from 'lucide-react';
import moment from 'moment'; // To format the time as "X ago"
import { CircleX } from 'lucide-react';
import toast from 'react-hot-toast';

const CommentDiv = ({ commentInfo, onClose, assignId }) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false); // State to toggle visibility of the floating div
    const [unArchiveData, setUnArchiveData] = useState([]);
    const [archiveData, setArchiveData] = useState([]);
    const userType = sessionStorage.getItem('user_type');
    const [commentData, setCommentData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading..Please wait');

    const getProfilePicInitials = (name) => {
        const firstName = name.split(' ')[0]; // Get the first word of the name
        return firstName.charAt(0).toUpperCase(); // Return the first letter
    };

    const [visibleCommentId, setVisibleCommentId] = useState(null);

    const handleAdminClick = (id) => {
        setVisibleCommentId(prevId => (prevId === id ? null : id));
    };
    const fetchData = async () => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/getcommentsarchivetabs', {
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
                setUnArchiveData(data.UnArchiveData || []); // Default to empty object if undefined
                setArchiveData(data.ArchiveData || []); // Default to empty object if undefined
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {


        if (assignId) {
            fetchData();
        }
    }, [assignId]); // Run effect when assignId changes

    const saveCommentsArchive = async (assignId) => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/savecommentsarchive', {
                method: 'POST',
                body: JSON.stringify({ assign_id: assignId })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status) {
                toast.success('Comments archived successfully!');
                fetchData();
            }
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const getArchiveComments = async (archiveNo) => {
        try {
            setLoading(true);
            const response = await fetch('https://99crm.phdconsulting.in/zend/api/getquerycomments', {
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
                if (data.CommentInfo.length == 0) {
                    setLoadingMessage('No comments available!');
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getArchiveComments(0);
    }, []);

    useEffect(() => {
        console.log("unarchieve" + unArchiveData)
    }, [unArchiveData])
    useEffect(() => {
        console.log("archieve" + Archive)
    }, [Archive])


    return (
        <div className="bg-light p-3 relative col-md-12 mt-3">
            

            <div className='flex justify-content-between align-items-end border-bottom pb-2 mb-2'>
                <h2 className="text-lg font-semibold">Previous Comments</h2>
                <button
                    onClick={onClose}
                    className="btn btn-danger btn-sm"
                >
                    <X size={13} />
                </button>
            </div>
            <div className="row">
                {/* Archive Tabs Section */}
                <div className="col-md-10 mb-2">
                    {archiveData.length > 0 && (
                        <ul className=" space-x-1 flex">
                            {archiveData.map((data) => (
                                <li key={data.archive_no} id={`archiveList${data.archive_no}`}>
                                    <button
                                        style={{ color: "#444", borderRadius: "0" }}
                                        data-toggle="tab"
                                        className='btn btn-warning btn-sm my-2'
                                        onClick={() => getArchiveComments(data.archive_no)}
                                    >
                                        Archive {data.archive_no}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Save Archive Button Section saveCommentsArchive(assignId)*/}
                <div className="col-md-2">
                    {userType === "user" && Array.isArray(unArchiveData) && unArchiveData.length > 0 && (
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
            <div className='h-[500px] overflow-y-scroll'>
                {commentData.length > 0 ? (
                    commentData.map((comment) => (
                        <div key={comment.id} className="border-b p-3 mb-4 bg-white rounded-md relative "

                        >
                            <div className="flex items-start space-x-4 mb-4">
                                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                                    {comment.comments_sent_type == "user" ? getProfilePicInitials(comment.name) : getProfilePicInitials(comment.FromName)}
                                </div>
                                <div>
                                    <h6 className="font-semibold" style={{ fontSize: "16px" }}>{comment.subject}</h6>
                                    <p
                                        onClick={() => comment.comments_sent_type === "user" && handleAdminClick(comment.id)}// Add onClick handler for the admin name
                                        className="text-sm text-blue-500 cursor-pointer mt-1"
                                    >
                                        {comment.comments_sent_type == "user" ? comment.name : "From: " + comment.FromName}
                                    </p>
                                </div>
                                <div className="flex justify-end text-sm text-gray-500 items-center w-50">
                                    {moment.unix(comment.date).fromNow()}
                                    {comment.track_status.trim() != "" && (
                                        <span className='text-green-600 font-semibold ml-5 tenpx'>{comment.track_status}</span>
                                    )}
                                </div>
                            </div>

                            {
                                comment.email_body && (
                                    <div
                                        className="mt-2 px-2"
                                        dangerouslySetInnerHTML={{ __html: comment.email_body }}
                                    />
                                )
                            }

                            {comment.comments && (
                                <div
                                    className="mt-4"
                                    dangerouslySetInnerHTML={{ __html: comment.comments }}
                                />
                            )}


                            {visibleCommentId == comment.id && (
                                <div style={{ fontSize: "12px" }} className="absolute top-12 left-0 bg-white rounded p-2 mt-4 ms-4 w-lg border z-50">
                                    <button
                                        onClick={() => { setVisibleCommentId(null) }}
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
        </div>
    );
};

export default CommentDiv;
