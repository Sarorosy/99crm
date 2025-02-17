import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';
import { Send, SendHorizonal } from "lucide-react";

const WhatsappChatArea = ({ company_id, refId }) => {
    const userType = sessionStorage.getItem("user_type")
    const [templates, setTemplates] = useState([]);
    const [selectedOption, setSelectedOption] = useState("Message");
    const [message, setMessage] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedTemplateDescription, setSelectedTemplateDescription] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const [messages, setMessages] = useState([]);
    const [lastId, setLastId] = useState(0);

    // Fetch templates on component mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.post(
                    "https://99crm.phdconsulting.in/api/getwhatsappchatarea",
                    { ref_id: refId }
                );

                if (response.data.status && response.data.templateList.status) {
                    setTemplates(response.data.templateList.data);
                } else {
                    console.error("Failed to fetch templates:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching templates:", error);
            }
        };

        fetchTemplates();
    }, [refId]);

    useEffect(() => {
        const fetchChatMessages = async () => {
            try {
                const response = await axios.post(
                    "https://99crm.phdconsulting.in/api/getwhatsappchat",
                    {
                        ref_id: refId,
                        lastId: lastId,
                    }
                );

                if (response.data.success) {
                    const newMessages = response.data.data || [];
                    setMessages((prevMessages) => [...prevMessages, ...newMessages]);
                    setLastId(response.data.lastId);
                }
            } catch (error) {
                console.error("Error fetching chat messages:", error);
            }
        };

        // Set interval to fetch new messages every 10 seconds
        const interval = setInterval(fetchChatMessages, 10000);

        // Clear interval on component unmount
        return () => clearInterval(interval);
    }, [refId, lastId]);

    const renderMessageList = () => {
        if (messages.length === 0) {
            return <div className="direct-chat-msg not-found text-center bg-gray-100 py-2 rounded my-2">No Messages found.</div>;
        }

        return messages.map((item, index) => {
            const isUserMessage = item.chat_message_type === "user";
            const messageContent = item.chat_message;
            let messageHtml = '';

            if (messageContent.message_content_type === 'Image' && messageContent.media_url) {
                messageHtml = `<a target="_blank" href="${messageContent.media_url}"><img src="${messageContent.media_url}" class="eWmQIP" /></a>`;
            } else if (messageContent.message_content_type === 'Document' && messageContent.media_url) {
                messageHtml = `<a download href="${messageContent.media_url}">Download File</a>`;
            } else {
                messageHtml = messageContent.message;
            }

            return (
                <div className={`direct-chat-msg ${isUserMessage ? 'right' : 'left'}`} key={index}>
                    <div className="direct-chat-infos clearfix">
                        <span className={`direct-chat-name ${isUserMessage ? 'float-right' : 'float-left'}`}>
                            {item.sender_name}
                        </span>
                    </div>
                    <img className="direct-chat-img" src="/images/user.png" alt="message user image" />
                    <div className="direct-chat-text">
                        <div>{messageHtml}</div>
                    </div>
                    <span className={`direct-chat-timestamp ${isUserMessage ? 'float-right' : 'float-left'}`}>
                        {item.received_at}
                    </span>
                </div>
            );
        });
    };

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleTemplateChange = (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);

        const selectedTemplate = templates.find(template => template.id == templateId);
        setSelectedTemplateDescription(selectedTemplate ? selectedTemplate.description : '');
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedOption === "Message") {
            if (!message || message.trim() == "") {
                toast.error("Message should not be empty!")
            }
        } else if (selectedOption === "Template") {
            if (selectedTemplate == "") {
                toast.error("Please select a template!")
            }
        }
        const formData = new FormData();
        formData.append('messageType', selectedOption);
        formData.append('templateName', selectedTemplate);
        formData.append('chat_message', message);
        formData.append('user_name', sessionStorage.getItem("name"));
        if (file) {
            formData.append('chatFile', file);
        }
        formData.append('lastId', 0);
        formData.append('ref_id', refId);

        try {
            // Use axios to send the form data
            const response = await axios.post('https://99crm.phdconsulting.in/api/submitwhatsappchat', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Handle the response
            if (response.data.success) {
                toast.success(response.data.message || "Form submitted successfully!");
                setError('');
                setFile(null);
                setMessage('');
            } else {
                //toast.error(response.data.message || "Something went wrong!");
                setError(response.data.message ?? "Something went wrong!");
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error("Error submitting the form!");
        }
        // You can add your API submission logic here
    };

    return (
        <div className="px-2 py-1 max-w-2xl mx-auto bg-white shadow-lg rounded-md">

            {error && (
                <div className="alert alert-warning">
                    {error}
                </div>
            )}
            <div className="chatAreaDiv">
                <div className="direct-chat-messages">
                    {renderMessageList()}
                </div>
            </div>
            {userType != "Data Manager" && userType != "Operations Manager" && (
            <form onSubmit={handleSubmit}>
                {/* Radio Buttons */}
                <div className="mb-4">
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            className={`py-2 px-6 rounded-md focus:outline-none ${selectedOption === "Message"
                                ? "bg-blue-600 text-white shadow-inner"
                                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
                                }`}
                            onClick={() => setSelectedOption("Message")}
                        >
                            Message
                        </button>
                        <button
                            type="button"
                            className={`py-2 px-6 rounded-md focus:outline-none ${selectedOption === "Template"
                                ? "bg-blue-600 text-white shadow-inner"
                                : "bg-gray-200 text-gray-700 hover:bg-blue-200"
                                }`}
                            onClick={() => setSelectedOption("Template")}
                        >
                            Template
                        </button>
                    </div>
                </div>


                {/* Message Input */}
                {selectedOption === "Message" && (
                    <div className="mb-4">
                        <textarea
                            className="w-full p-2 border rounded-md"
                            rows="4"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                        <div className="mt-2">
                            <label className="block mb-2 font-medium">Attach File:</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                )}

                {/* Template Dropdown */}
                {selectedOption === "Template" && (
                    <>
                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Select Template:</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={selectedTemplate}
                                onChange={handleTemplateChange}
                            >
                                <option value="">-- Select a Template --</option>
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.template_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedTemplate && selectedTemplateDescription && (
                            <div className="mb-4">
                                {selectedTemplateDescription}
                            </div>
                        )}

                    </>
                )}

                <div className="flex items-center justify-end mb-2">
                    <button
                        type="submit"
                        className="ml-auto bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                        {selectedOption === "Message" ? (
                            <div className="flex items-center ">
                                <Send className="mr-2" size={18} />
                                Submit
                            </div>
                        ) : (
                            <div className="flex items-center ">
                                <SendHorizonal className="mr-2" size={18} />
                                Send
                            </div>
                        )}

                    </button>
                </div>
            </form>
            )}
            
        </div>
    );
};

export default WhatsappChatArea;
