import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

const ShowAttachedFiles = ({ refId, crmId }) => {
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null); // State to store the file
    const [uploading, setUploading] = useState(false); // State for uploading status

    const fetchAttachedFiles = async () => {
        try {
            const response = await axios.post(
                "https://99crm.phdconsulting.in/zend/api/getattachedfiles",
                {
                    ref_id: refId,
                    user_type: sessionStorage.getItem("user_type"),
                }
            );

            if (response.data.status) {
                setAttachedFiles(response.data.commentFiles);
            } else {
                console.error("Error fetching attached files");
            }
        } catch (error) {
            console.error("Error fetching attached files:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttachedFiles();
    }, [refId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Update state with the selected file
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file first.");
            return;
        }
        setUploading(true);

        // Create a FormData object to send the file along with other data
        const formData = new FormData();
        formData.append("ref_id", refId);
        formData.append("crm_id", crmId);
        formData.append("user_id", sessionStorage.getItem("id"));
        formData.append("attached_file", file); // Attach the selected file

        try {
            const response = await axios.post(
                "https://99crm.phdconsulting.in/zend/api/upload-query-attached-files",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // Important for file uploads
                    },
                }
            );

            if (response.data.status) {
                toast.success("File uploaded successfully!");
                setFile(null);
                fetchAttachedFiles();
                
            } else {
                console.error("Error uploading file");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }} >
        {Array.from({ length: 2 }).map((_, index) => (
            <div
                key={index}
                style={{
                    height: "100px",
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
    </div>;
    }

    return (
        <div className="flex flex-column mt-3">
            {/* File upload form */}
            <div className="bg-light p-2 relative">
            <div className="">
                <h3 className="f-13 font-semibold mb-2 text-gray-800">Upload File</h3>
                <form onSubmit={handleFileUpload} className="space-y-2">
                    <div className="flex items-center space-x-4 dashboardinputs">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="form-control form-control-sm"
                        />
                        <button
                            type="submit"
                            disabled={uploading}
                            className="btn btn-primary btn-sm flex items-center"
                        >
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </form>
            </div>
            </div>
            <div className="bg-light p-2 relative">
            {/* Attached files list */}
            <h2 className="f-13 font-semibold mb-2 text-gray-800">Attached Files</h2>
            {attachedFiles.length === 0 ? (
                <p className='text-center bg-blue-100 px-2 py-2 flex items-center justify-center'>No files attached.</p>
            ) : (
                <ul className="space-y-4 bg-none">
                    {attachedFiles.map((file, index) => (
                        <li key={index} className="bg-white px-2 py-2 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <a
                                    href={file.files_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-medium text-md f-12"
                                >
                                    {file.files}
                                </a>
                                <span className="text-xs text-gray-400">{file.files_date}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600 f-12">
                                <p className="f-12">
                                    <strong>Uploaded By:</strong> {file.uploaded_by}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            </div>
            
        </div>
    );
};

export default ShowAttachedFiles;
