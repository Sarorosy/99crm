import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import QueryDetails from '../../managequery/QueryDetails';
import ReactQuill from 'react-quill';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';

const WorkSpaceQueryDetails = ({ queryId, onClose, finalFunction }) => {
    const [queryInfo, setQueryInfo] = useState(null);
    const [profileData, setProfileData] = useState(null);
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
    const [companyData, setCompanyData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedWebsiteForForm, setSelectedWebsiteForForm] = useState("");

    const [websites, setWebsites] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [selectedAllocatedTo, setSelectedAllocatedTo] = useState("");
    const [userProfiles, setUserProfiles] = useState([]);
    const [selectedUserProfile, setSelectedUserProfile] = useState("");

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
                const response = await fetch('https://99crm.phdconsulting.in/zend/api/getworkspacequerydetails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query_id: queryId,
                        user_type: sessionStorage.getItem('user_type'),
                        user_id: sessionStorage.getItem('id'),
                    })
                });

                const data = await response.json();

                if (data.status) {
                    console.log(data);
                    setQueryInfo(data.QueryInfo);
                    setCompanyData(data.companyData);
                    setProfileData(data.profileData ?? []);
                    setUsersList(data.userList ?? []);
                    setValidationStatus(data.QueryInfo.validation_status);

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

    const OpenQueryDetailsPopUp = (refId) => {
        setSelectedQueryToOpen(refId);
        setDetailsOpen(true);
    };

    const handleCompanyChange = async (event) => {
        const companyId = event.target.value;
        setSelectedCompany(companyId);
        setWebsites([]);
        try {
            const response = await axios.post(
                "https://99crm.phdconsulting.in/zend/api/getcompanywisewebsite",
                { company_id: companyId }
            );
            if (response.data.status) {
                setWebsites(response.data.websites);
            }

        } catch (error) {
            console.error("Error:", error);
        }

    };
    const handleAllocateToChange = async (event) => {
        const allocatedTo = event.target.value;
        setSelectedAllocatedTo(allocatedTo);
        setUserProfiles([]);
        try {
            const response = await axios.post(
                "https://99crm.phdconsulting.in/zend/api/getuserprofiles",
                { user_id: allocatedTo, website_id: queryInfo?.website_id }
            );
            if (response.data.status) {
                setUserProfiles(response.data.data);
            }

        } catch (error) {
            console.error("Error:", error);
        }

    };

    const handleMarkAsDuplicate = async (queryId) => {
        try {

            const response = await fetch('https://99crm.phdconsulting.in/zend/api/workspaceduplicate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query_id: queryId })
            })
            const data = await response.json();
            if (data.status) {
                toast.success(data.message || 'Marked as duplicate successfully');
                onClose();
                finalFunction();
            } else {
                toast.error(data.message || 'Failed to mark as duplicate');
            }

        } catch (error) {
            console.error("Error:", error);
        }
    }

    const handleUserShiftLeadIn = async (queryId) => {
        try {
            if(sessionStorage.getItem("user_type") != "user"){
                if(!selectedAllocatedTo) {
                    toast.error("Please select allocated to");
                    return;
                }
                if(!selectedUserProfile) {
                    toast.error("Please select user profile");
                    return;
                }
            }

            const response = await fetch('https://99crm.phdconsulting.in/zend/api/claimworkspacequery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    user_id : sessionStorage.getItem('id'),
                    user_name : sessionStorage.getItem('name'),
                    username : sessionStorage.getItem('username'),
                    query_id: queryId,
                    allocacted_to : selectedAllocatedTo,
                    profile_id : selectedUserProfile,
                 })
            })
            const data = await response.json();
            if (data.status) {
                toast.success(data.message || 'Lead shifted successfully');
                onClose();
                finalFunction();
            } else {
                toast.error(data.message || 'Failed to shift lead');
            }
        }catch (error) {
            console.error("Error:", error);
        }
    }

    const handleGenericToWorkSpace = async (queryId) => {
        try {
            if(!selectedCompany) {
                toast.error("Please select Company");
                return;
            }
            if(!selectedWebsiteForForm) {
                toast.error("Please select website");
                return;
            }

            const response = await fetch('https://99crm.phdconsulting.in/zend/api/generictoworkspacequery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    user_id : sessionStorage.getItem('id'),
                    user_name : sessionStorage.getItem('name'),
                    username : sessionStorage.getItem('username'),
                    query_id: queryId,
                    website_generic : selectedWebsiteForForm,
                    company_id : selectedCompany,
                 })
            })
            const data = await response.json();
            if (data.status) {
                toast.success(data.message || 'Lead shifted successfully');
                onClose();
                finalFunction();
            } else {
                toast.error(data.message || 'Failed to shift lead');
            }
        }catch (error) {
            console.error("Error:", error);
        }
    }

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
                            <h2 className="text-lg font-bold">WorkSpace Query Details</h2>
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
                            {queryInfo?.generic_query == "Yes" && (
                                <div>
                                    <div className="flex">
                                        <div className="w-5/12"><label>Generic Query</label></div>
                                        <div className="w-1/12"></div>
                                        <div className="w-6/12 text-xsm elevenpx">
                                            <span className={`px-2 py-1 text-xsm rounded-md bg-yellow-500 text-white`}>
                                                {queryInfo.generic_query}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="row mt-2 ">
                                        <div class="col-md-5"><label>Company</label></div>
                                        <div class="col-md-1"></div>
                                        <div class="col-md-6 mx-auto">
                                            <select class="form-control" name="company_id" id="company_id"
                                                value={selectedCompany}
                                                onChange={handleCompanyChange}
                                            >
                                                <option value="">Select Company</option>
                                                {companyData?.map((company) => (
                                                    <option key={company.id} value={company.id}>
                                                        {company.company_name}
                                                    </option>
                                                ))}

                                            </select>
                                        </div>
                                    </div>
                                    <div class="row mt-2 ">
                                        <div class="col-md-5"><label>Website</label></div>
                                        <div class="col-md-1"></div>
                                        <div class="col-md-6 mx-auto">
                                            <select class="form-control" name="website" id="website"
                                                value={selectedWebsiteForForm}
                                                onChange={(e) => {
                                                    setSelectedWebsiteForForm(e.target.value);
                                                }}
                                            >
                                                <option value="">Select Website</option>
                                                {websites?.map((website) => (
                                                    <option key={website.id} value={website.id}>
                                                        {website.website}
                                                    </option>
                                                ))}

                                            </select>
                                        </div>
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
                            {queryInfo?.generic_query != "Yes" && (
                                (sessionStorage.getItem("user_type") == "sub-admin" || sessionStorage.getItem("user_type") == "Operations Manager") && (
                                    <div>
                                        <div class="row">
                                            <div class="col-md-5"><label>Allocate To</label></div>
                                            <div class="col-md-1"></div>
                                            <div class="col-md-6">
                                                <select name="allocated_to" id="allocated_to" class="form-control"
                                                    value={selectedAllocatedTo}
                                                    onChange={handleAllocateToChange}
                                                >
                                                    <option value="">Please Select</option>
                                                    {usersList?.map((user) => (
                                                        <option
                                                            key={user.id}
                                                            value={user.id}
                                                        >{user.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div class="row">
                                            <div class="col-md-5"><label>Select Profile</label></div>
                                            <div class="col-md-1"></div>
                                            <div class="col-md-6">
                                                <select name="profile" id="profile" class="form-control"
                                                    value={selectedUserProfile}
                                                    onChange={(e) => {
                                                        setSelectedUserProfile(e.target.value);
                                                    }}
                                                >
                                                    <option value="">Please Select</option>
                                                    {userProfiles?.map((profile) => (
                                                        <option
                                                            key={profile.id}
                                                            value={profile.id}
                                                        >{profile.profile_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                            {queryInfo?.generic_query != "Yes" && (
                                (sessionStorage.getItem("user_type") == "sub-admin" || sessionStorage.getItem("user_type") == "user" || sessionStorage.getItem("user_type") == "Operations Manager") && (
                                    <div class="row justify-items-end">
                                        {queryInfo?.duplicate == "" && (
                                            <button
                                                onClick={() => { handleMarkAsDuplicate(queryInfo.id) }}
                                                className='bg-orange-500 tenpx w-25 text-white px-2 py-1 rounded-md shadow-sm hover:bg-orange-600 transition-colors'>
                                                Mark as Duplicate
                                            </button>
                                        )}
                                        {sessionStorage.getItem("user_type") == "user" ? (
                                            <button className='bg-blue-500 tenpx w-25 text-white px-2 py-1 rounded-md shadow-sm hover:bg-blue-600 transition-colors ml-2'
                                            onClick={() => handleUserShiftLeadIn(queryInfo.id)}
                                            >
                                                Shift Lead In
                                            </button>
                                        ): (
                                            <button 
                                            onClick={()=>{handleUserShiftLeadIn(queryInfo.id)}}
                                            className='bg-blue-500 tenpx w-25 text-white px-2 py-1 rounded-md shadow-sm hover:bg-blue-600 transition-colors ml-2'>
                                                Shift Lead In
                                            </button>
                                        )}

                                    </div>
                                ))}
                                {queryInfo?.generic_query == "Yes" && (
                                    <div class="row justify-items-end">
                                        <button 
                                        onClick={() => { handleGenericToWorkSpace(queryInfo.id) }}
                                        className='bg-orange-500 tenpx w-25 text-white px-2 py-1 rounded-md shadow-sm hover:bg-orange-600 transition-colors '>
                                            Claim
                                        </button>
                                    </div>
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
        </motion.div >
    );
};

export default WorkSpaceQueryDetails;
