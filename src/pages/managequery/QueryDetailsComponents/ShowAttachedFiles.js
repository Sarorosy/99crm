import React, { useEffect, useState } from "react";
import axios from "axios";

const ShowAttachedFiles = ({ refId }) => {
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null); // State to store the file
    const [uploading, setUploading] = useState(false); // State for uploading status

    const fetchAttachedFiles = async () => {
        try {
            const response = await axios.post(
                "https://99crm.phdconsulting.in/api/getattachedfiles",
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
        formData.append("crm_id", sessionStorage.getItem("crm_id"));
        formData.append("user_id", sessionStorage.getItem("id"));
        formData.append("attached_file", file); // Attach the selected file

        try {
            const response = await axios.post(
                "https://99crm.phdconsulting.in/api/upload-query-attached-files",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // Important for file uploads
                    },
                }
            );

            if (response.data.status) {
                alert("File uploaded successfully!");
                // Optionally, refresh the attached files list after successful upload
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
        return <div>Loading...</div>;
    }

    return (
        <div className="mt-6 px-4">
            {/* File upload form */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Upload File</h3>
                <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="border border-gray-300 rounded px-4 py-2"
                        />
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-blue-600 text-white py-2 px-6 rounded disabled:bg-gray-400"
                        >
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Attached files list */}
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Attached Files</h2>
            {attachedFiles.length === 0 ? (
                <p className="text-gray-500">No files attached.</p>
            ) : (
                <ul className="space-y-4">
                    {attachedFiles.map((file, index) => (
                        <li key={index} className="bg-white px-2 py-2 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                                <a
                                    href={file.files_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-medium text-md"
                                >
                                    {file.files}
                                </a>
                                <span className="text-xs text-gray-400">{file.files_date}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                <p>
                                    <strong>Uploaded By:</strong> {file.uploaded_by}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ShowAttachedFiles;
