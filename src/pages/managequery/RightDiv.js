import React, { act, useState } from "react";
import WhatsappChatArea from "./QueryDetailsComponents/WhatsappChatArea";
import { Twitch } from "lucide-react";
import EmailDiv from "./QueryDetailsComponents/EmailDiv";
import { AnimatePresence } from "framer-motion";
import CommentDiv from "./QueryDetailsComponents/CommentDiv";

const RightDiv = ({ queryInfo, tempateInfo  , commentInfo , whatsappOptions, callOptions}) => {

    const userType = sessionStorage.getItem('user_type');
    const [activeTab, setActiveTab] = useState('email');
    //const [commentInfo, setCommentInfo] = useState([]);
    const [commentsDivVisible, setCommentsTabVisible] = useState(false);

    const handleWhatsAppChat = () => {
        setActiveTab('whatsapp');
    };

    const handleGetAutoComments = async () => {

        // const queryData = {
        //     assign_qid: String(queryInfo.assign_id),
        //     archive_no: String(0),
        // };
        // console.log("Request Payload:", queryData);

        // try {
        //     const response = await fetch('https://99crm.phdconsulting.in/api/getquerycomments', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(queryData),
        //     });

        //     const data = await response.json();
        //     console.log(data)
        //     setCommentInfo(data.CommentInfo);
            
        //     setCommentsTabVisible(true);
            
        // } catch (error) {
        //     console.error('Error fetching comments:', error);
        // }
        setCommentsTabVisible(true);

    };

    const handleEmailMessageArea = () => {
        setActiveTab('email');
    };

    const handleStatusChange = (event) => {
        console.log("Status changed to:", event.target.value);
    };

    return (
        <div className="col-md-7 connectedSortable bg-white rounded shadow-md" id="rightColomnDiv">
            {/* Right Section */}
            <div className="box box-primary direct-chat direct-chat-primary ">
                <div className="flex justify-between items-center px-4 py-3 border-b">
                    <h3 className="text-lg font-semibold">
                        Comments
                    </h3>

                    <div className="flex space-x-4">
                        {queryInfo.company_id && queryInfo.interakt_api && queryInfo.company_id != "" && queryInfo.interakt_api != "" && activeTab != "whatsapp" ? (
                            <button
                                className="flex items-center bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600"
                                onClick={handleWhatsAppChat}
                                style={{ fontSize: "10px" }}
                            >
                                <Twitch size={14} className="mr-2" /> WhatsApp Chat
                            </button>
                        ) : ""}
                        {activeTab == "whatsapp" && (
                            <button

                                className="flex items-center bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600"
                                onClick={handleEmailMessageArea}

                            >
                                <i className="fa fa-envelope mr-2" aria-hidden="true"></i> Email Message
                            </button>
                        )}

                        <button
                            className="flex items-center bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-600"
                            onClick={handleGetAutoComments}
                        >
                            <i className="fa fa-fw fa-refresh mr-2"></i> Show Conversations
                        </button>
                    </div>
                </div>

                {activeTab == "whatsapp" ? (
                    <div className="box-body my-2">
                        <WhatsappChatArea company_id={queryInfo.company_id} refId={queryInfo.assign_id} />
                    </div>
                ) : (

                    <div className="box-body emailBodyArea">
                        <EmailDiv queryInfo={queryInfo} templateInfo={tempateInfo} commentInfo={commentInfo} whatsappOptions={whatsappOptions} callOptions={callOptions}/>
                    </div>
                )}




            </div>
            <AnimatePresence>
                {commentsDivVisible && (
                    <CommentDiv commentInfo={commentInfo} onClose={()=>{setCommentsTabVisible(!commentsDivVisible)}} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default RightDiv;
