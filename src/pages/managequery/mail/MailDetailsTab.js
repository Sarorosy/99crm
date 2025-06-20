import React, { useEffect, useState } from "react";
import axios from "axios";
import { CircleX, Expand, Frown, Minimize2, Paperclip, Rows4 } from "lucide-react";
import './fullscreenmodal.css';


const MailDetailsTab = ({ mailid, onClose }) => {
    const [mailInfo, setMailInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullscreen, setFullScreen] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        const fetchMailDetails = async () => {
            try {
                const response = await axios.post("https://99crm.phdconsulting.in/zend/api/getmaildetails", {
                    mail_id: mailid,
                });

                if (response.data.status) {
                    setMailInfo(response.data.mailInfo);
                } else {
                    console.error("Mail details not found");
                }
            } catch (error) {
                console.error("Error fetching mail details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMailDetails();
    }, [mailid]);

    if (loading) return <p>Loading...</p>;

    return (
        <div className={fullscreen ? 'custom-modal ' : 'col-md-4 shadow-lg  bg-white px-2 py-2 relative'}>
            <div className={` ${fullscreen ? "custom-modal-content maild" : ""} `}>

                <div className="flex items-center justify-between space-x-5 my-1">
                    <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`flex items-center gap-2 px-2 py-1 rounded fsx transition ${activeTab === "details" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        <Rows4 size={14} /> Details
                    </button>

                    <button
                        onClick={() => setActiveTab("attachments")}
                        className={`flex items-center gap-2 px-2 py-1 rounded fsx transition ${activeTab === "attachments" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        <Paperclip size={14} /> Attachments
                    </button></div>
                    <div className="flex items-center justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setFullScreen(false);
                                        onClose();
                                    }}
                                    className=" bg-red-500  rounded-full trx p-0 text-sm m-1 text-white hover:text-red-600 transition-colors cremove"
                                >
                                    <CircleX size={14} />
                                </button>
                                {fullscreen ? (
                                    <button
                                        onClick={() => { setFullScreen(false) }}
                                        className=" bg-gray-100 rounded trx p-0 text-sm m-1 text-gray-800  transition-colors cremove"
                                    >
                                        <Minimize2 size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setFullScreen(true) }}
                                        className=" bg-gray-100 rounded trx p-0 text-sm m-1 text-gray-800  transition-colors cremove"
                                    >
                                        <Expand size={14} />
                                    </button>
                                )}
                            </div>
                </div>

                {activeTab == "details" ? (
                    <>
                        <div className='rounded-lg p-2'>
                            
                            <h3 className="text-xl font-semibold text-gray-900">{mailInfo.Subject}</h3>
                            <div className="mt-4 text-gray-700 fsx">
                                <p>
                                    <span className="font-bold">From:</span> {" "}
                                    <strong>{mailInfo.FromName}</strong> &lt;{mailInfo.FromEmail}&gt;
                                </p>
                                <p>
                                    <span className="font-bold">To:</span> {mailInfo.ToEmail}
                                </p>
                                <p>
                                    <span className="font-bold">Date:</span> {mailInfo.Date}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {new Date(mailInfo.created_date).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className={` ${fullscreen ? "h-[38vh] rounded-lg mt-2 p-2  maildiv custom-scrollbar overflow-y-scroll" : " rounded-lg mt-4 p-2  maildiv custom-scrollbar overflow-y-scroll"} `} >
                            <div
                                className="text-gray-800 fsx"
                                dangerouslySetInnerHTML={{ __html: mailInfo.TextBody || "<p>No message content available.</p>" }}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        {mailInfo.Attachments ? (
                            <div className="mt-4 border-t pt-4">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h4>
                                <div className="flex flex-col gap-2">
                                    {mailInfo.Attachments.split("||").map((file, index) => {
                                        const fileName = file.replace("public/UploadFolder/", "");
                                        return (
                                            <div key={index} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                                <i className="fa fa-paperclip"></i>
                                                <a target="_blank" href={`https://99crm.phdconsulting.in/zend/public/UploadFolder/${file}`} download>
                                                    {fileName}
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className=" mt-5 alert alert-warning flex items-center text-center p-2">No attachments Found <Frown size={18}/></p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MailDetailsTab;
