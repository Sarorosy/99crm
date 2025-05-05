import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery'; // Import jQuery for Select2 initialization
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, X } from 'lucide-react';
import { ScaleLoader } from 'react-spinners';
import { CircleX } from 'lucide-react';
import { motion } from 'framer-motion';

const EditUser = ({ id, onClose, after }) => {



    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        cpassword: '',
        email_id: '',
        mobile_no: '',
        user_type: '',
        access_type: '',
        team_id: [],
        website_id: [],
        website: '',
        manager_id: '',
        backup_user: '',
        campaign_type: '',
        profile_name: '',
        website_email: '',
        current_status: '',
        signature: '',
        category: '',
        whatsap_notification: false,
        sms_notify: false,
        download_option: false,
        accessQuoteApproval: '',
        accessQuoteEdit: '',
        accessWebsite: '',
        accessQueryShiftComment: '',
        accessQueryTransRepliShift: '',
        accessPriceQuote: '',
        accessQueryDelete: '',
        disabledQuery: [],
        profiles: [],
        daily_work_status: 0
    });

    const [teams, setTeams] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [managers, setManagers] = useState([]);
    const [backupusers, setBackupusers] = useState([]);
    const selectTeamRef = useRef(null);
    const selectWebsiteRef = useRef(null);
    const selectManagerRef = useRef(null);
    const selectBackUsersRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState('');
    const [loading, setloading] = useState(true);
    const navigate = useNavigate();
    const [addnewProfile, setAddNewProfile] = useState(false);

    useEffect(() => {
        // Fetch data from APIs
        const fetchData = async () => {
            try {
                setloading(true);
                const [teamResponse, websiteResponse, managerResponse, userResponse, backupusersResponse] = await Promise.all([
                    fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/teams'),
                    fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/websites'),
                    fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/opsmanagers'),
                    fetch(`https://99crm.phdconsulting.in/zend/99crmwebapi/api/edituser/${id}`),
                    fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/getallusers'),
                ]);

                const teamData = await teamResponse.json();
                const websiteData = await websiteResponse.json();
                const managerData = await managerResponse.json();
                const userData = await userResponse.json();
                const backupusersData = await backupusersResponse.json();

                setTeams(teamData.data); // Assuming teamData is an array
                setWebsites(websiteData.data); // Assuming websiteData is an array
                setManagers(managerData.data); // Assuming managerData is an array
                setFormData(userData.data);
                setBackupusers(backupusersData.data);

                if (userData.data.user_type == 'sub-admin') {
                    const { Website_id, team_id } = userData.data;
                    let access_type = '';

                    // Determine access type based on team_id and Website_id
                    if (Website_id && team_id) {
                        access_type = 'Both';
                    } else if (Website_id) {
                        access_type = 'Website';
                    } else if (team_id) {
                        access_type = 'Team';
                    } else {
                        access_type = '';
                    }

                    // Update the formData with access_type
                    setFormData(prevState => ({
                        ...prevState,
                        access_type: access_type
                    }));

                    // Ensure team_id and Website_id are arrays
                    const teamIds = team_id ? team_id.split(",") : []; // Convert to array
                    console.log("teamIdss:", teamIds);

                    const websiteIds = Website_id ? Website_id.split(",") : []; // Convert to array if necessary
                    console.log("websiteIds:", websiteIds);


                    const subAdminCheckboxes = {
                        accessQuoteApproval: userData.data.accessQuoteApproval == 'Yes',
                        accessQuoteEdit: userData.data.accessQuoteEdit == 'Yes',
                        accessWebsite: userData.data.accessWebsite == 'Yes',
                        accessQueryShiftComment: userData.data.accessQueryShiftComment == 'Yes',
                        accessQueryTransRepliShift: userData.data.accessQueryTransRepliShift == 'Yes',
                        accessPriceQuote: userData.data.accessPriceQuote == 'Yes',
                        accessQueryDelete: userData.data.accessQueryDelete == 'Yes',
                    };
                    console.log(subAdminCheckboxes)


                    setFormData((prevData) => ({
                        ...prevData,
                        team_id: teamIds, // Ensure it's an array
                        website_id: websiteIds, // Ensure it's an array
                        ...subAdminCheckboxes
                    }));

                    // Optionally, call the handleAccessTypeChange function if needed
                    handleAccessTypeChange(access_type);
                } else if (userData.data.user_type == 'user') {

                    const userCheckboxes = {
                        accessQuoteApproval: userData.data.accessQuoteApproval === 'Yes',
                        accessQuoteEdit: userData.data.accessQuoteEdit === 'Yes',
                        accessQueryShiftComment: userData.data.accessQueryShiftComment === 'Yes',
                        accessQueryTransRepliShift: userData.data?.accessQueryTransRepliShift === 'Yes',
                        accessPriceQuote: userData.data.accessPriceQuote === 'Yes',
                        accessQueryDelete: userData.data.accessQueryDelete === 'Yes',
                        disabledQuery: userData.data.disabledQuery || [],
                        boxQuery: userData.data.disabledQuery?.includes('box-query') || false,
                        addQuery: userData.data.disabledQuery?.includes('add-query') || false,
                    };
                    const { team_id } = userData.data;

                    const teamIds = team_id ? team_id.split(',') : []; // Convert to array


                    setFormData((prevData) => ({
                        ...prevData,
                        ...userCheckboxes,
                        team_id: teamIds
                    }));

                } else {
                    const { team_id } = userData.data;
                    const teamIds = team_id ? team_id.split(',') : []; // Convert to array


                    setFormData((prevData) => ({
                        ...prevData,
                        team_id: teamIds,
                    }));
                }


            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setloading(false)
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Initialize select2 for Select Team
        if (selectTeamRef.current) {
            const $select = $(selectTeamRef.current);

            // Only initialize if not already initialized
            if (!$select.data('select2')) {
                $select.select2({
                    placeholder: "Select a Team",
                    allowClear: true,
                    multiple: true,
                }).on('change', (e) => {
                    const selectedValues = $(e.target).val();
                    setFormData(prevData => ({
                        ...prevData,
                        team_id: selectedValues || [],
                    }));
                });

                // Set initial value
                $select.val(formData.team_id).trigger('change');
            }
        }

        return () => {
            // Cleanup select2
            if (selectTeamRef.current) {
                const $select = $(selectTeamRef.current);
                if ($select.data('select2')) {
                    $select.select2('destroy');
                }
            }
        };
    }, [teams]); // Only re-run when teams changes

    useEffect(() => {
        // Initialize select2 for Operations Manager
        if (selectBackUsersRef.current) {
            const $select = $(selectBackUsersRef.current);

            // Only initialize if not already initialized
            if (!$select.data('select2')) {
                $select.select2({
                    placeholder: "Select Backup user",
                    allowClear: true,
                }).on('change', (e) => {
                    setFormData(prevData => ({
                        ...prevData,
                        [e.target.name]: e.target.value,
                    }));
                });

                // Set initial value
                $select.val(formData.backup_user).trigger('change');
            }
        }

        return () => {
            if (selectBackUsersRef.current) {
                const $select = $(selectBackUsersRef.current);
                if ($select.data('select2')) {
                    $select.select2('destroy');
                }
            }
        };
    }, [backupusers]); // Only re-run when backupusers changes


    useEffect(() => {
        // Initialize select2 for Select Website
        if (selectWebsiteRef.current) {
            const $select = $(selectWebsiteRef.current);

            // Only initialize if not already initialized
            if (!$select.data('select2')) {
                $select.select2({
                    placeholder: "Select a Website",
                    allowClear: true,
                    multiple: true,
                }).on('change', (e) => {
                    const selectedValues = $(e.target).val();
                    setFormData(prevData => ({
                        ...prevData,
                        website_id: selectedValues || [],
                    }));
                });

                // Set initial value
                $select.val(formData.website_id).trigger('change');
            }
        }

        return () => {
            if (selectWebsiteRef.current) {
                const $select = $(selectWebsiteRef.current);
                if ($select.data('select2')) {
                    $select.select2('destroy');
                }
            }
        };
    }, [websites]); // Only re-run when websites changes

    useEffect(() => {
        // Initialize select2 for Operations Manager
        if (selectManagerRef.current) {
            const $select = $(selectManagerRef.current);

            // Only initialize if not already initialized
            if (!$select.data('select2')) {
                $select.select2({
                    placeholder: "Select an Operations Manager",
                    allowClear: true,
                }).on('change', (e) => {
                    setFormData(prevData => ({
                        ...prevData,
                        [e.target.name]: e.target.value,
                    }));
                });

                // Set initial value
                $select.val(formData.manager_id).trigger('change');
            }
        }

        return () => {
            if (selectManagerRef.current) {
                const $select = $(selectManagerRef.current);
                if ($select.data('select2')) {
                    $select.select2('destroy');
                }
            }
        };
    }, [managers]); // Only re-run when managers changes


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword); // Toggle the visibility
    };

    const handleUsernameCheck = (e) => {
        const username = e.target.value;

        if (username.length > 2) {  // Only check after 3 characters are entered
            fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/checkusername', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }) // Sending username as JSON body
            })
                .then((response) => response.json()) // Parse the response as JSON
                .then((data) => {
                    if (data.status === true) {
                        setUsernameStatus('✔️ Username available');
                    } else {
                        setUsernameStatus('❌ Username not available');
                    }
                })
                .catch((error) => {
                    console.error('There was an error checking the username!', error);
                    setUsernameStatus('❌ Error occurred');
                });
        } else {
            setUsernameStatus('');
        }
    };


    const handleUserTypeChange = (e) => {
        const { value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            user_type: value,
            access_type: '', // Reset access_type on user_type change
            team_id: [], // Clear team selection
            website_id: [], // Clear website selection
            campaign_type: '', // Clear campaign type if changed to a non-campaign manager
        }));
        if (selectTeamRef.current) {
            $(selectTeamRef.current).val(null).trigger('change'); // Clear select2 selection
        }
    };

    const handleAccessTypeChange = (e) => {
        const { value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            access_type: value,
            website_id: value === 'Website' || value === 'Both' ? prevData.website_id : [],
            team_id: value === 'Team' || value === 'Both' ? prevData.team_id : [],
        }));
    };

    const handleFormDataChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get the form by ID
        const form = document.getElementById('user_form');
        if (!form) {
            console.error("Form not found!");
            return;
        }

        // A flag to track if the form is valid
        let formIsValid = true;

        // Get form elements by their ID
        const formElements = Array.from(form.elements);

        // Validate the fields
        for (let element of formElements) {
            const { name, value, type, style } = element;

            // Skip invisible elements
            if (element.offsetParent === null) continue;

            // Field-specific validation
            switch (name) {
                case 'name':
                    if (!/^[A-Za-z\s]+$/.test(value.trim())) {
                        element.style.border = '2px solid red';
                        toast.error('Name should contain only alphabets and spaces');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;



                case 'password':
                    if (value.length < 6) {
                        element.style.border = '2px solid red';
                        toast.error('Password must be at least 6 characters long');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;



                case 'email_id':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                        element.style.border = '2px solid red';
                        toast.error('Invalid email format');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                case 'mobile_no':
                    if (!/^\d{10}$/.test(value.trim())) {
                        element.style.border = '2px solid red';
                        toast.error('Mobile number must be 10 digits');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                case 'category':
                    if (!value.trim()) {
                        element.style.border = '2px solid red';
                        toast.error('Category is required');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                case 'user_type':
                    if (!value.trim()) {
                        element.style.border = '2px solid red';
                        toast.error('User Type is required');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                case 'team_id':
                case 'website_id':
                    if (formData.user_type === 'user' && (!value || value.length === 0)) {
                        element.style.border = '2px solid red';
                        toast.error(`${name} is required`);
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                case 'access_type':
                    if (formData.user_type === 'subadmin' && (!value || value.length === 0)) {
                        element.style.border = '2px solid red';
                        toast.error('Access Type is required');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                case 'signature':
                case 'profile_name':
                case 'website_email':
                    if (formData.user_type === 'user' && !value.trim()) {
                        element.style.border = '2px solid red';
                        toast.error(`${name} is required`);
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;
                case 'website':
                    if (formData.user_type === 'user' && !value.trim()) {
                        element.style.border = '2px solid red';
                        toast.error(`${name} is required`);
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                case 'manager_id':
                    if (formData.user_type === 'user' && !value.trim()) {
                        element.style.border = '2px solid red';
                        toast.error('Manager ID is required');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                case 'campaign_type':
                    if (formData.user_type === 'campaign manager' && !value.trim()) {
                        element.style.border = '2px solid red';
                        toast.error('Campaign Type is required');
                        formIsValid = false;
                    } else {
                        element.style.border = '';
                    }
                    break;

                default:
                    break;
            }
        }

        // If the form is not valid, prevent submission
        if (!formIsValid) {
            return;
        }

        // Proceed with form submission if everything is valid
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/zend/99crmwebapi/api/updateuser/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (response.ok) {
                toast.success('User Updated successfully!');
                form.reset();
                sessionStorage.removeItem('usersData');
                setTimeout(() => {
                    onClose();
                    after();

                }, 1000)

            } else {
                toast.error('Error updating user: ' + result.message);
                // Handle error (e.g., show error message, etc.)
            }
        } catch (error) {
            toast.error('An error occurred: ' + error.message);
            // Handle network or other errors
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, type, checked, value } = e.target;

        setFormData((prevState) => {
            // For checkboxes that are arrays like disabledQuery
            if (name === 'disabledQuery') {
                const newArray = checked
                    ? [...prevState.disabledQuery, value]
                    : prevState.disabledQuery.filter((item) => item !== value);
                return { ...prevState, disabledQuery: newArray };
            }

            return { ...prevState, [name]: type === 'checkbox' ? checked : value };
        });
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-50 shadow-lg z-50 overflow-y-auto p-6"
        >
            <section className="content-header my-2 col-md-12">
                <h1 className='text-md text-center font-bold'>Edit User</h1>
                <button
                    onClick={onClose}
                    className="absolute trx p-2 text-gray-600 hover:text-red-600 transition-colors cremove"
                >
                    <CircleX size={32} />
                </button>
            </section>
            {loading ? (<div className='w-full h-60 flex items-center justify-center'>
                <ScaleLoader />
            </div>) : <>
                <section className="">
                    <div className="row">
                        <div className="col-md-10 cent add">
                            <div className="box box-primary">
                                <form onSubmit={handleSubmit} id="user_form" name="user_form" className='space-y-4 p-4 border-t-2 rounded border-green-400 bg-white shadow-xl'>
                                    <div className="box-body">
                                        <div className="my-2 flex items-center justify-between mb-3">
                                            <div class="col-md-6">
                                                <label>Name<span className="error">*</span></label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={handleFormDataChange}
                                                />
                                            </div>
                                            <div class="col-md-6">
                                                <div className='disabled'>
                                                    <label>Username<span className="error">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        className="form-control"
                                                        value={formData.username}
                                                        disabled
                                                        onChange={handleFormDataChange}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="my-2 flex items-center justify-between mb-3">
                                            <div class="col-md-6">
                                                <label>Password<span className="error">*</span></label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        className="form-control"
                                                        value={formData.password}
                                                        onChange={handleFormDataChange}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={togglePasswordVisibility}
                                                        className="absolute right-2 top-2"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff />
                                                        ) : (
                                                            <Eye />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label>Category</label>
                                                <div className="row px-1 py-1">
                                                    <div className="col-sm-3">
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            id="category1"
                                                            className="flat-red"
                                                            value="PhD"
                                                            checked={formData.category === 'PhD'}
                                                            onChange={handleFormDataChange}
                                                        /> &nbsp;
                                                        <label htmlFor="category1">PhD</label>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            id="category2"
                                                            className="flat-red"
                                                            value="Sales"
                                                            checked={formData.category === 'Sales'}
                                                            onChange={handleFormDataChange}
                                                        /> &nbsp;
                                                        <label htmlFor="category2">Sales</label>
                                                    </div>
                                                </div>
                                                <div id="categoryError" className="error"></div>
                                            </div>
                                        </div>

                                        <div className="w-full my-2 flex items-center justify-between space-x-3">
                                            <div className="w-1/2">
                                                <label>Email ID<span className="error">*</span></label>
                                                <input
                                                    type="text"
                                                    name="email_id"
                                                    className="form-control"
                                                    value={formData.email_id}
                                                    onChange={handleFormDataChange}
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <label>Mobile No.<span className="error">*</span></label>
                                                <input
                                                    type="text"
                                                    name="mobile_no"
                                                    className="form-control"
                                                    value={formData.mobile_no}
                                                    onChange={handleFormDataChange}
                                                />
                                            </div>

                                        </div>

                                        <div className="w-full my-2 flex items-center justify-between space-x-3">
                                            <div className="w-1/2">
                                                <label>User Type<span className="error">*</span></label>
                                                <select
                                                    name="user_type"
                                                    className="form-control"
                                                    value={formData.user_type}
                                                    onChange={handleUserTypeChange}

                                                >
                                                    <option value="">Select User Type</option>
                                                    <option value="sub-admin">Sub Admin</option>
                                                    <option value="user">User</option>
                                                    <option value="Data Manager">Data Manager</option>
                                                    <option value="Consultant">Consultant</option>
                                                    <option value="Campaign Manager">Campaign Manager</option>
                                                    <option value="Accountant">Accountant</option>
                                                    <option value="Operations Manager">Operations Manager</option>
                                                </select>
                                            </div>
                                            {formData.user_type === 'sub-admin' && (
                                                <div className="w-1/2">
                                                    <div className="row form-group">
                                                        <div className="col-sm-12">
                                                            <label>Select Access Type</label>
                                                            <select
                                                                name="access_type"
                                                                className="form-control"
                                                                value={formData.access_type}
                                                                onChange={handleAccessTypeChange}
                                                            >
                                                                <option value="">Select Access Type</option>
                                                                <option value="Team">Team</option>
                                                                <option value="Website">Website</option>
                                                                <option value="Both">Both</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                            )}
                                        </div>



                                        <div className="w-full my-2">
                                            {/* Select Team Section */}
                                            <div
                                                className="col-md-12"
                                                style={{
                                                    display: (formData.access_type === 'Team' ||
                                                        formData.access_type === 'Both' ||
                                                        formData.user_type === 'user' ||
                                                        formData.user_type === 'Data Manager' ||
                                                        formData.user_type === 'Accountant' ||
                                                        formData.user_type === 'Consultant' ||
                                                        formData.user_type === 'Campaign Manager' ||
                                                        formData.user_type === 'Operations Manager')
                                                        ? 'block' : 'none'
                                                }}
                                            >
                                                <div className="flex flex-col space-y-2">
                                                    <label className="font-medium text-gray-700">Select Team</label>
                                                    <select
                                                        name="team_id"
                                                        multiple
                                                        className="form-control p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={formData.team_id}
                                                        ref={selectTeamRef}
                                                    >
                                                        {teams.map((team) => (
                                                            <option key={team.id} value={team.id}>
                                                                {team.team_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Select Website Section */}
                                            <div
                                                className="w-1/2 mx-2"
                                                style={{
                                                    display: (formData.access_type === 'Website' ||
                                                        formData.access_type === 'Both')
                                                        ? 'block' : 'none'
                                                }}
                                            >
                                                <div className="flex flex-col space-y-2">
                                                    <label className="font-medium text-gray-700">Select Website</label>
                                                    <select
                                                        name="website_id[]"
                                                        multiple
                                                        className="form-control p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={formData.website_id}
                                                        // onChange={handleFormDataChange}
                                                        ref={selectWebsiteRef}
                                                    >
                                                        {websites.map((website) => (
                                                            <option key={website.id} value={website.id}>
                                                                {website.website}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {formData.user_type === 'Campaign Manager' && (
                                                <div className="w-full my-2">
                                                    <div className="col-sm-12">
                                                        <label>Campaign Type</label>
                                                        <select
                                                            name="campaign_type"
                                                            className="form-control"
                                                            value={formData.campaign_type}
                                                            onChange={handleFormDataChange}
                                                        >
                                                            <option value="">Select Campaign Type</option>
                                                            <option value="Email-Whatsapp">Email/Whatsapp</option>
                                                            <option value="Calling">Calling</option>
                                                            <option value="Both">Both</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="w-full my-2" style={{ display: formData.user_type === 'user' ? 'block' : 'none' }}>
                                            <div className='flex items-center justify-between my-2'>
                                                <div className='col-md-6'>
                                                    <div className="">
                                                        <label>Operations Manager</label>
                                                        <select
                                                            name="manager_id"
                                                            className="form-control"
                                                            value={formData.manager_id}
                                                            onChange={handleFormDataChange}
                                                            ref={selectManagerRef}
                                                        >
                                                            {managers.map((manager) => (
                                                                <option key={manager.id} value={manager.id}>
                                                                    {manager.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className='col-md-6'>
                                                    <div className="">
                                                        <label>Backup User</label>
                                                        <select
                                                            name="backup_user"
                                                            className="form-control"
                                                            value={formData.manager_id}
                                                            onChange={handleFormDataChange}
                                                            ref={selectBackUsersRef}
                                                        >
                                                            <option value="" >Select Backup User</option>
                                                            {backupusers.map((user) => (
                                                                <option key={user.id} value={user.id}>
                                                                    {user.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-between my-2'>
                                                <div className="w-1/2 flex flex-col mx-1">
                                                    <label>Current Status</label>
                                                    <select
                                                        name="current_status"
                                                        className="form-control"
                                                        value={formData.current_status}
                                                        onChange={handleFormDataChange}

                                                    >
                                                        <option value="Present">Present</option>
                                                        <option value="Absent">Absent</option>

                                                    </select>
                                                </div>

                                            </div>


                                            {formData.user_type === 'user' && (
                                                <div>
                                                    {formData.profiles.map((profile, index) => (
                                                        <div key={index} className='flex items-start justify-between my-2 relative'>
                                                            {/* Profile inputs */}
                                                            <div className="w-1/4 mx-1">
                                                                <label>Profile Name</label>
                                                                <input
                                                                    type="text"
                                                                    name="profile_name"
                                                                    className="form-control"
                                                                    value={profile.profile_name || ''}
                                                                    onChange={(e) => {
                                                                        const updatedProfiles = [...formData.profiles];
                                                                        updatedProfiles[index] = {
                                                                            ...updatedProfiles[index],
                                                                            profile_name: e.target.value
                                                                        };
                                                                        setFormData({
                                                                            ...formData,
                                                                            profiles: updatedProfiles
                                                                        });
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="w-1/4 mx-1">
                                                                <label>Select Website</label>
                                                                <select
                                                                    name="website"
                                                                    className="form-control"
                                                                    value={profile.website || ''}
                                                                    onChange={(e) => {
                                                                        const updatedProfiles = [...formData.profiles];
                                                                        updatedProfiles[index] = {
                                                                            ...updatedProfiles[index],
                                                                            website: e.target.value
                                                                        };
                                                                        setFormData({
                                                                            ...formData,
                                                                            profiles: updatedProfiles
                                                                        });
                                                                    }}
                                                                >
                                                                    <option value="">Select website</option>
                                                                    {websites.map((website) => (
                                                                        <option key={website.id} value={website.id}>
                                                                            {website.website}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="w-1/4 mx-1">
                                                                <label>Website Email</label>
                                                                <input
                                                                    type="text"
                                                                    name="website_email"
                                                                    className="form-control"
                                                                    value={profile.website_email || ''}
                                                                    onChange={(e) => {
                                                                        const updatedProfiles = [...formData.profiles];
                                                                        updatedProfiles[index] = {
                                                                            ...updatedProfiles[index],
                                                                            website_email: e.target.value
                                                                        };
                                                                        setFormData({
                                                                            ...formData,
                                                                            profiles: updatedProfiles
                                                                        });
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="w-1/4 mx-1">
                                                                <label className="font-medium text-gray-700">Signature</label>
                                                                <ReactQuill
                                                                    value={profile.signature || ''}
                                                                    onChange={(content) => {
                                                                        setFormData((prevData) => {
                                                                            const updatedProfiles = [...prevData.profiles];
                                                                            updatedProfiles[index] = {
                                                                                ...updatedProfiles[index],
                                                                                signature: content
                                                                            };
                                                                            return { ...prevData, profiles: updatedProfiles };
                                                                        });
                                                                    }}

                                                                    modules={{
                                                                        toolbar: [
                                                                            ['bold', 'italic', 'underline'],
                                                                            [{ align: [] }],
                                                                            [{ list: 'ordered' }, { list: 'bullet' }],
                                                                            ['link'],
                                                                            ['clean']
                                                                        ],
                                                                    }}
                                                                    formats={[
                                                                        'bold', 'italic', 'underline', 'align',
                                                                        'list', 'bullet', 'link', 'clean'
                                                                    ]}
                                                                    placeholder="Signature"
                                                                />
                                                            </div>

                                                            {addnewProfile && index === formData.profiles.length - 1 && (
                                                                <button
                                                                    type="button"
                                                                    className=" text-red-500 hover:text-red-700 bg-red-300 rounded-full p-1"
                                                                    onClick={() => {
                                                                        const updatedProfiles = formData.profiles.filter((_, i) => i !== index);
                                                                        setFormData({
                                                                            ...formData,
                                                                            profiles: updatedProfiles
                                                                        });
                                                                        setAddNewProfile(false);
                                                                    }}
                                                                >
                                                                    <X size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* Add new profile button */}
                                                    {!addnewProfile && (
                                                        <div className="flex justify-end mt-2">
                                                            <button
                                                                type="button"
                                                                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                                                                onClick={() => {
                                                                    setFormData({
                                                                        ...formData,
                                                                        profiles: [
                                                                            ...formData.profiles,
                                                                            {
                                                                                profile_name: '',
                                                                                website: '',
                                                                                website_email: '',
                                                                                signature: ''
                                                                            }
                                                                        ]
                                                                    });
                                                                    setAddNewProfile(true);
                                                                }}
                                                            >
                                                                + Add Another Profile
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}


                                        </div>


                                        <div className="w-full mt-3" style={{
                                            display: (formData.user_type === 'user') ? 'block' : 'none',
                                        }}>

                                        </div>
                                        {formData.user_type === 'sub-admin' && (
                                            <div className='mulabel my-2 space-y-1'>
                                                {['accessQuoteApproval', 'accessQuoteEdit', 'accessWebsite', 'accessQueryShiftComment', 'accessQueryTransRepliShift', 'accessPriceQuote', 'accessQueryDelete'].map((permission) => (
                                                    <label key={permission}>
                                                        <input
                                                            type="checkbox"
                                                            name={permission}
                                                            checked={formData[permission]} // Direct comparison with 'Yes'
                                                            onChange={handleCheckboxChange}
                                                        /> {permission.replace(/([A-Z])/g, ' $1').toUpperCase()}
                                                    </label>
                                                ))}
                                            </div>
                                        )}


                                        {/* User Checkboxes */}
                                        {formData.user_type === 'user' && (
                                            <div className='mulabel my-2 space-y-1'>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="accessQuoteApproval"
                                                        checked={formData.accessQuoteApproval}
                                                        onChange={handleCheckboxChange}
                                                    /> Price Quote Approval
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="accessQuoteEdit"
                                                        checked={formData.accessQuoteEdit}
                                                        onChange={handleCheckboxChange}
                                                    /> Edit Quote Approval
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="accessQueryShiftComment"
                                                        checked={formData.accessQueryShiftComment}
                                                        onChange={handleCheckboxChange}
                                                    /> Query Shift With Comments
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="accessQueryTransRepliShift"
                                                        checked={formData.accessQueryTransRepliShift}
                                                        onChange={handleCheckboxChange}
                                                    /> Query Transfer Replicate Shift
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="accessPriceQuote"
                                                        checked={formData.accessPriceQuote}
                                                        onChange={handleCheckboxChange}
                                                    /> View Price Quote
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="accessQueryDelete"
                                                        checked={formData.accessQueryDelete}
                                                        onChange={handleCheckboxChange}
                                                    /> Query Delete Button
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="disabledQuery"
                                                        value="add-query"
                                                        checked={formData.disabledQuery.includes('add-query')}
                                                        onChange={handleCheckboxChange}
                                                    /> Disable Add query
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        name="disabledQuery"
                                                        value="box-query"
                                                        checked={formData.disabledQuery.includes('box-query')}
                                                        onChange={handleCheckboxChange}
                                                    /> Disable Claim Box Query
                                                </label>

                                            </div>
                                        )}
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="daily_work_status"
                                                checked={formData.daily_work_status == 1}
                                                onChange={() => {
                                                    setFormData(prevState => ({
                                                        ...prevState,
                                                        daily_work_status: prevState.daily_work_status == 1 ? 0 : 1
                                                    }));
                                                }}
                                            /> Ask Daily Work Status
                                        </label>


                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            type="submit"
                                            onClick={handleSubmit}
                                            className="px-4 py-2 text-white rounded btn btn-success"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </>}

        </motion.div>
    );
};

export default EditUser;
