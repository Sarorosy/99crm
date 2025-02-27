import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import QueryDetails from '../../managequery/QueryDetails';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ValidationQueryDetails = ({ queryId, onClose, finalFunction }) => {
    const [queryInfo, setQueryInfo] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [showApprovedComment, setShowApprovedComment] = useState(false);
    const [showRejectComment, setShowRejectComment] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationType, setValidationType] = useState("");
    const [validationStatus, setValidationStatus] = useState("");
    const [comment, setComment] = useState("");
    const [file, setFile] = useState(null);
    const [allocatedTo, setAllocatedTo] = useState("");
    const [allocatedToProfile, setAllocatedToProfile] = useState('');
    const [alreadyAssign, setAlreadyAssign] = useState("No");

    const [existingLeads, setExistingLeads] = useState([]);
    const [selectedQueryToOpen, setSelectedQueryToOpen] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [fromEmail, setFromEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [emailSignature, setEmailSignature] = useState("");

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    };

    // Fetch query details when component mounts
    useEffect(() => {
        const fetchQueryDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://99crm.phdconsulting.in/api/validationquerydetails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query_id: queryId,
                        user_type: sessionStorage.getItem('user_type')
                    })
                });

                const data = await response.json();

                if (data.status) {
                    setQueryInfo(data.QueryInfo);
                    setValidationStatus(data.QueryInfo.validation_status);
                    console.log(data.QueryInfo);
                    setProfileData(data.profileData);
                    console.log("profile data", data.profileData);
                } else {
                    console.error('Failed to fetch query details');
                }
            } catch (error) {
                console.error('Error fetching query details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQueryDetails();
    }, [queryId]);

    const getSourceOfLeadLabel = (source) => {
        const sourceMap = {
            '100': { text: '100 >> Google', className: 'bg-blue-200 text-blue-800' },
            '200': { text: '200 >> FB', className: 'bg-blue-500 text-white' },
            '300': { text: '300 >> Mailer Campaign', className: 'bg-yellow-500 text-white' },
            '400': { text: '400 >> Interakt Campaign', className: 'bg-gray-500 text-white' },
            '500': { text: '500 >> Through call', className: 'bg-green-500 text-white' },
            '600': { text: '600 >> Through Whatsapp', className: 'bg-red-500 text-white' }
        };

        const sourceInfo = sourceMap[source];
        return sourceInfo ? (
            <span className={`px-2 py-1 text-xsm rounded-md ${sourceInfo.className}`}>
                {sourceInfo.text}
            </span>
        ) : null;
    };
    const handleProfileChange = async (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        setAllocatedTo(e.target.value);
        setAllocatedToProfile(selectedOption.getAttribute('data-profile_id'));

        try {
            const response = await fetch('https://99crm.phdconsulting.in/api/checkexistemailandwebsite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email_id: queryInfo.email_id,
                    company_id: queryInfo.company_id
                })
            });

            const data = await response.json();
            setAlreadyAssign(data.totalRecord > 0 ? "Yes" : "No");
            setExistingLeads(data.array || []); // Add this state variable
        } catch (error) {
            console.error('Error checking existing email:', error);
        }
    }

    const OpenQueryDetailsPopUp = (refId) => {
        setSelectedQueryToOpen(refId);
        setDetailsOpen(true);
    };

    const handleShiftLeadIn = async () => {
        try {
            const formData = new FormData();

            if (validationType == "Call") {
                if (validationStatus == "Approved" && !comment) {
                    toast.error("Please enter comments");
                    return;
                }
                if (validationStatus == "Approved" && !allocatedTo) {
                    toast.error("Please select profile");
                    return;
                }
                if (validationStatus == "Rejected" && !comment) {
                    toast.error("Please enter comments");
                    return;
                }
                if (!validationStatus) {
                    toast.error("Please select status");
                    return;
                }
            }
            formData.append('email_id_val', queryInfo.email_id);
            formData.append('validation_type', validationType);
            formData.append('validation_status', validationStatus);
            formData.append('allocated_to', allocatedTo);
            formData.append('approved_comment', validationStatus === 'Approved' ? comment : '');
            formData.append('reject_comment', validationStatus === 'Rejected' ? comment : '');

            if (file) {
                formData.append('comments_file', file);
            }
            formData.append('post_user_id', sessionStorage.getItem('id'));
            formData.append('post_user_name', sessionStorage.getItem('name'));

            // Email related fields
            formData.append('mail_from_email', '');
            formData.append('mail_to', queryInfo.email_id);
            formData.append('mail_subject', '');
            formData.append('email_temp_body', '');
            formData.append('_wysihtml5_mode', '1');
            formData.append('mail_signature', '');

            // Query related fields
            formData.append('query_id', queryInfo.id);
            formData.append('company_id', queryInfo.company_id);
            formData.append('website', queryInfo.website_id || '70');
            formData.append('query_email_id', queryInfo.email_id);
            formData.append('check_already_assign', alreadyAssign);

            // Get profile_id from selected option
            const selectedOption = document.getElementById('allocated_to')?.selectedOptions[0];
            const profileId = selectedOption?.getAttribute('data-profile_id') || '';
            formData.append('profile_id', queryInfo.validation_email_userid);

            const response = await fetch('https://99crm.phdconsulting.in/api/claimvalidationquery', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.status) {
                if (data.success == "1") {
                    toast.success(data.message || "Lead shifted successfully");
                } else {
                    toast.error(data.message || "Failed to shift lead");
                }
                onClose();
                finalFunction();
            } else {
                toast.error(data.message || 'Failed to shift lead');
            }
        } catch (error) {
            console.error('Error shifting lead:', error);
            toast.error('An error occurred while shifting the lead');
        }
    };

    const handleEmailSubmit = async () => {
        try {
            // Form validation
            if (!fromEmail) {
                toast.error("Please enter From Email");
                return;
            }
            if (!subject) {
                toast.error("Please enter Subject");
                return;
            }
            if (!emailBody) {
                toast.error("Please enter Email Body");
                return;
            }
            if (!emailSignature) {
                toast.error("Please enter Email Signature");
                return;
            }
            if (!allocatedTo) {
                toast.error("Please select profile");
                return;
            }

            const formData = new FormData();

            // Required fields
            formData.append('email_id_val', queryInfo.email_id);
            formData.append('validation_type', 'Email');
            formData.append('validation_status', validationStatus);
            formData.append('allocated_to', allocatedTo);
            formData.append('approved_comment', comment);
            formData.append('reject_comment', comment);

            // Email specific fields
            formData.append('mail_from_email', fromEmail);
            formData.append('mail_to', queryInfo.email_id);
            formData.append('mail_subject', subject);
            formData.append('email_temp_body', emailBody);
            formData.append('mail_signature', emailSignature);

            // Query related fields
            formData.append('query_id', queryInfo.id);
            formData.append('company_id', queryInfo.company_id);
            formData.append('website', queryInfo.website_id || '70');
            formData.append('query_email_id', queryInfo.email_id);
            formData.append('check_already_assign', alreadyAssign);
            formData.append('profile_id', allocatedTo);
            formData.append('post_user_id', sessionStorage.getItem('id'));
            formData.append('post_user_name', sessionStorage.getItem('name'));

            if (file) {
                formData.append('comments_file', file);
            }

            const response = await fetch('https://99crm.phdconsulting.in/api/submitemailvalidate', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.status) {
                if (data.success == "1") {
                    toast.success(data.message || "Email sent successfully");
                    onClose();
                    finalFunction();
                } else {
                    toast.error(data.message || "Failed to send email");
                }
            } else {
                toast.error(data.message || "Failed to send email");
            }
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('An error occurred while sending the email');
        }
    };

    const handleAdminShiftToLeadIn = async () => {
        try {
            if (!allocatedToProfile) {
                toast.error("Please select profile");
                return;
            }
            if (!allocatedTo) {
                toast.error("Please select profile");
                return;
            }

            const formData = new FormData();
            formData.append('email_id_val', queryInfo.email_id);
            formData.append('query_id', queryInfo.id);
            formData.append('company_id', queryInfo.company_id);
            formData.append('website', queryInfo.website_id || '70');
            formData.append('query_email_id', queryInfo.email_id);
            formData.append('check_already_assign', alreadyAssign);
            formData.append('profile_id', allocatedToProfile);
            formData.append('allocated_to', allocatedTo);
            formData.append('post_user_id', sessionStorage.getItem('id'));
            formData.append('post_user_name', sessionStorage.getItem('name'));

            const response = await fetch('https://99crm.phdconsulting.in/api/claimrejectedvalidationquery', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.status) {
                toast.success(data.message || "Lead shifted successfully");
                onClose();
                finalFunction();
            } else {
                toast.error(data.message || 'Failed to shift lead');
            }
        } catch (error) {
            console.error('Error shifting lead:', error);
            toast.error('An error occurred while shifting the lead');
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="h-full w-1/2 bg-white shadow-lg"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <div className="p-6 overflow-y-scroll h-full">
                        <div className='flex items-center justify-between'>
                            <h2 className="text-lg font-bold">Validation Query Details</h2>
                            <button
                                onClick={onClose}
                                className='bg-red-500 text-white px-2 py-1 rounded-md shadow-sm hover:bg-red-600 transition-colors'
                            >
                                <X size={15} />
                            </button>
                        </div>
                        <div className='mt-4 space-y-2 text-sm'>
                            {queryInfo?.name && (
                                <div className="flex">
                                    <div className="w-5/12"><label>Name</label></div>
                                    <div className="w-1/12"></div>
                                    <div className="w-6/12">{queryInfo.name}</div>
                                </div>
                            )}

                            {queryInfo?.email_id && (
                                <div className="flex">
                                    <div className="w-5/12"><label>Email</label></div>
                                    <div className="w-1/12"></div>
                                    <div className="w-6/12">
                                        <div id="Showemail_idDiv">
                                            <span id="Getemail_id">{queryInfo.email_id}</span>
                                            {/* Email edit functionality can be added here */}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {queryInfo?.phone && (
                                <div className="flex">
                                    <div className="w-5/12"><label>Contact No.</label></div>
                                    <div className="w-1/12"></div>
                                    <div className="w-6/12">{queryInfo.phone}</div>
                                </div>
                            )}

                            {queryInfo?.website && (
                                <div className="flex">
                                    <div className="w-5/12"><label>Website</label></div>
                                    <div className="w-1/12"></div>
                                    <div className="w-6/12">
                                        {queryInfo.website === "others" ? queryInfo.other_website : queryInfo.website}
                                    </div>
                                </div>
                            )}

                            {queryInfo?.duplicate && (
                                <div className="flex">
                                    <div className="w-5/12"><label>Duplicate</label></div>
                                    <div className="w-1/12"></div>
                                    <div className="w-6/12">
                                        <span className="bg-red-500 text-white px-2 py-1 rounded-md">{queryInfo.duplicate}</span>
                                    </div>
                                </div>
                            )}

                            {queryInfo?.sourceoflead && (
                                <div className="flex">
                                    <div className="w-5/12"><label>Source of Lead</label></div>
                                    <div className="w-1/12"></div>
                                    <div className="w-6/12 text-xsm elevenpx">
                                        {getSourceOfLeadLabel(queryInfo.sourceoflead)}
                                    </div>
                                </div>
                            )}

                            <div className="flex">
                                <div className="w-5/12"><label>Created Date</label></div>
                                <div className="w-1/12"></div>
                                <div className="w-6/12">
                                    {queryInfo?.created_on && new Date(queryInfo.created_on * 1000).toLocaleString()}
                                </div>
                            </div>

                            {queryInfo && sessionStorage.getItem('user_type') == 'user' && sessionStorage.getItem('crmRoleType') == 'opsuser' && (
                                <div className="">
                                    {queryInfo.already_exist != "Yes" && (queryInfo.validation_status == "" || queryInfo.validation_status == null || queryInfo.validation_status == "On hold") && (
                                        <>
                                            {
                                                queryInfo.validation_type == "" || queryInfo.validation_type == null ? (
                                                    <div className="flex mt-4">
                                                        <div className="w-5/12">
                                                            <label>Validation Type</label>
                                                        </div>

                                                        <div className="w-1/2">
                                                            <select
                                                                className="w-full p-2 border rounded-md"
                                                                value={validationType}
                                                                onChange={(e) => {
                                                                    setValidationType(e.target.value);
                                                                }}
                                                            >
                                                                <option value="">Please Select</option>
                                                                <option value="Call">Call</option>
                                                                <option value="Email">Email</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ) : queryInfo.validation_type != "" && queryInfo.validation_type != null ? (
                                                    <div className="flex mt-4">
                                                        <div className="w-5/12"><label>Validation Type</label></div>
                                                        <div className="w-1/12"></div>
                                                        <div className="w-6/12">
                                                            {queryInfo.validation_type}
                                                        </div>
                                                    </div>
                                                ) : null
                                            }
                                            <div style={{ display: validationType !="" || validationType != null ||validationType == "Call" ? "block" : "none" }}>
                                                <div className="flex mt-4">
                                                    <div className="w-5/12"><label>Status</label></div>
                                                    <div className="w-1/12"></div>
                                                    <div className="">
                                                        <select
                                                            name="validation_status"
                                                            id="validation_status"
                                                            className="w-full p-2 border rounded-md"
                                                            value={validationStatus}
                                                            onChange={(e) => {
                                                                setValidationStatus(e.target.value);
                                                                setShowApprovedComment(e.target.value === 'Approved');
                                                                setShowRejectComment(e.target.value === 'Rejected');
                                                            }}
                                                        >
                                                            <option value="">Please Select</option>
                                                            <option value="Approved">Approved</option>
                                                            <option value="On hold">On Hold {'>'} Validation team is unable to contact</option>
                                                            <option value="Rejected">Rejected {'>'} No requirement/client refused requirement</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className=" mt-4" style={{ display: (validationStatus == "Approved" || validationType == "Email") ? 'flex' : 'none' }}>
                                                <div className="w-5/12"><label>Profile</label></div>
                                                <div className="w-1/12"></div>
                                                <div className="w-6/12">
                                                    <select
                                                        name="allocated_to"
                                                        id="allocated_to"
                                                        className="w-full p-2 border rounded-md"
                                                        value={allocatedTo}
                                                        onChange={(e) => handleProfileChange(e)}
                                                    >
                                                        <option value="">Please Select</option>
                                                        {profileData?.map((profile) => (
                                                            <option
                                                                key={profile.user_id}
                                                                value={profile.user_id}
                                                                data-profile_id={profile.profile_id}
                                                            >
                                                                {profile.profile_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className=" mt-4" style={{ display: validationStatus == "Approved" || validationStatus == "Rejected" ? 'flex' : 'none' }}>
                                                <div className="w-5/12"><label>Comment</label></div>
                                                <div className="w-1/12"></div>
                                                <div className="">
                                                    <textarea
                                                        name="comment"
                                                        id="comment"
                                                        className="w-full p-2 border rounded-md"
                                                        value={comment}
                                                        onChange={(e) => {
                                                            setComment(e.target.value);
                                                        }}
                                                    >

                                                    </textarea>

                                                </div>
                                            </div>
                                            <div className="flex mt-4" style={{ display: validationStatus === "Approved" ? 'flex' : 'none' }}>
                                                <div className="w-5/12"><label>Upload File</label></div>
                                                <div className="w-1/12"></div>
                                                <div className="w-6/12">
                                                    <input
                                                        type="file"
                                                        name="file"
                                                        onChange={(e) => {
                                                            setFile(e.target.files[0]);
                                                        }}

                                                        id="file"
                                                        className="w-full p-2 border rounded-md file:mr-4 file:py-0 file:px-2
                                                        file:rounded-md file:border-0
                                                        file:text-sm file:font-semibold
                                                        file:bg-blue-50 file:text-blue-700
                                                        hover:file:bg-blue-100"
                                                    />
                                                </div>
                                            </div>

                                            <div className="email-box mt-4" style={{ display: validationType === "Email" ? 'block' : 'none' }}>
                                                <div className="space-y-4">
                                                    <div className="flex">
                                                        <div className="w-5/12"><label>From:</label></div>
                                                        <div className="w-1/12"></div>
                                                        <div className="w-full">
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 border rounded-md"
                                                                name="mail_from_email"
                                                                id="mail_from_email"
                                                                value={fromEmail}
                                                                onChange={(e) => setFromEmail(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex">
                                                        <div className="w-5/12"><label>To:</label></div>
                                                        <div className="w-1/12"></div>
                                                        <div className="w-full">
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 bg-gray-100"
                                                                name="mail_to"
                                                                id="mail_to"
                                                                value={queryInfo?.email_id || ''}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex">
                                                        <div className="w-5/12"><label>Subject:</label></div>
                                                        <div className="w-1/12"></div>
                                                        <div className="w-full">
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 border rounded-md"
                                                                name="mail_subject"
                                                                id="mail_subject"
                                                                value={subject}
                                                                onChange={(e) => setSubject(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex">
                                                        <div className="w-5/12"><label>Email Body:</label></div>
                                                        <div className="w-1/12"></div>
                                                        <div className="w-full">
                                                            <ReactQuill
                                                                theme="snow"
                                                                value={emailBody}
                                                                onChange={setEmailBody}
                                                                modules={modules}
                                                                className="bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex">
                                                        <div className="w-5/12"><label>Email Signature:</label></div>
                                                        <div className="w-1/12"></div>
                                                        <div className="w-full">
                                                            <textarea
                                                                className="w-full p-2 border rounded-md"
                                                                name="mail_signature"
                                                                id="mail_signature"
                                                                rows={3}
                                                                value={emailSignature}
                                                                onChange={(e) => setEmailSignature(e.target.value)}
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {validationType != "Email" && (
                                                <div className='flex justify-end mt-4'>
                                                    <button onClick={handleShiftLeadIn} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors">
                                                        Shift Lead In
                                                    </button>
                                                </div>
                                            )}
                                            {validationType == "Email" && (
                                                <div className='flex justify-end mt-4'>
                                                    <button onClick={handleEmailSubmit} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors">
                                                        Submit
                                                    </button>
                                                </div>
                                            )}



                                        </>
                                    )}
                                </div>
                            )}
                            {queryInfo && sessionStorage.getItem('user_type') == "admin" && (
                                queryInfo.already_exist != "Yes" && queryInfo.validation_status == "Rejected" && (
                                    // ... existing code ...
                                    <div className="flex flex-col mt-4">
                                        <div className='w-full flex'>
                                            <div className="w-5/12"><label>Profile</label></div>
                                            <div className="w-1/12"></div>
                                            <div className="w-6/12">
                                                <select
                                                    name="allocated_to"
                                                    id="allocated_to"
                                                    className="w-full p-2 border rounded-md"
                                                    value={allocatedTo}
                                                    onChange={(e) => handleProfileChange(e)}
                                                >
                                                    <option value="">Please Select</option>
                                                    {profileData?.map((profile) => (
                                                        <option
                                                            key={profile.user_id}
                                                            value={profile.user_id}
                                                            data-profile_id={profile.profile_id}
                                                        >
                                                            {profile.profile_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className='w-full flex justify-end mt-2'>
                                            <button onClick={handleAdminShiftToLeadIn} className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors">
                                                Shift to lead in
                                            </button>
                                        </div>
                                    </div>
                                    // ... existing code ...
                                )
                            )}
                        </div>
                        {existingLeads.length > 0 && (
                            <div className="mt-4" style={{ fontSize: "12px" }}>
                                <div className="text-red-600 font-semibold mb-2">This lead already exists:</div>
                                <table className="w-full border-collapse border">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2">Ref. Id</th>
                                            <th className="border p-2">Allocate To</th>
                                            <th className="border p-2">Client Name</th>
                                            <th className="border p-2">Client Email ID</th>
                                            <th className="border p-2">Company</th>
                                            <th className="border p-2">Website</th>
                                            <th className="border p-2">Assign Date</th>
                                            <th className="border p-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {existingLeads.map((lead, index) => (
                                            <tr key={index}>
                                                <td className="border p-2">
                                                    <a className='bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors' href="javascript:" onClick={() => OpenQueryDetailsPopUp(lead.ref_id)}>
                                                        {lead.ref_id}
                                                    </a>
                                                </td>
                                                <td className="border p-2">{lead.user_name}</td>
                                                <td className="border p-2">{lead.client_name}</td>
                                                <td className="border p-2">{lead.client_email}</td>
                                                <td className="border p-2">{lead.company_name}</td>
                                                <td className="border p-2">{lead.website}</td>
                                                <td className="border p-2">{lead.assign_date}</td>
                                                <td className="border p-2">{lead.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
            <AnimatePresence>
                {detailsOpen && (
                    <QueryDetails refId={selectedQueryToOpen} onClose={() => setDetailsOpen(false)} />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ValidationQueryDetails;
