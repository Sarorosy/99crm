import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery'; // Import jQuery for Select2 initialization
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import { Editor } from '@tinymce/tinymce-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { CircleX, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';



const AddUser = ({ onClose, after }) => {
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
        campaign_type: '',
        profile_name: '',
        website_email: '',
        signature: '',
        category: '',
        whatsap_notification: false,
        sms_notify: false,
        download_option: false,
    });

    const [teams, setTeams] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [managers, setManagers] = useState([]);
    const selectTeamRef = useRef(null);
    const selectWebsiteRef = useRef(null);
    const selectManagerRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data from APIs
        const fetchData = async () => {
            try {
                const [teamResponse, websiteResponse, managerResponse] = await Promise.all([
                    fetch('https://99crm.phdconsulting.in/99crmwebapi/api/teams'),
                    fetch('https://99crm.phdconsulting.in/99crmwebapi/api/websites'),
                    fetch('https://99crm.phdconsulting.in/99crmwebapi/api/opsmanagers')
                ]);

                const teamData = await teamResponse.json();
                const websiteData = await websiteResponse.json();
                const managerData = await managerResponse.json();

                setTeams(teamData.data); // Assuming teamData is an array
                setWebsites(websiteData.data); // Assuming websiteData is an array
                setManagers(managerData.data); // Assuming managerData is an array
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectTeamRef.current).select2({
            placeholder: "Select a Team",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            console.log("Selected team IDs:", selectedValues);
            setFormData((prevData) => ({
                ...prevData,
                team_id: selectedValues || [], // Ensure it's an array
            }));
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectTeamRef.current) {
                $(selectTeamRef.current).select2('destroy');
            }
        };
    }, [teams]);
    useEffect(() => {
        console.log("Updated formData:", formData);
    }, [formData]);


    useEffect(() => {
        // Initialize select2 for Select Website
        if (selectWebsiteRef.current) {
            $(selectWebsiteRef.current).select2({
                placeholder: "Select a Website",
                allowClear: true,
                multiple: true,
            }).on('change', (e) => {
                const selectedValues = $(e.target).val(); // Use select2's value retrieval method
                console.log("Selected website IDs:", selectedValues);
                setFormData((prevData) => ({
                    ...prevData,
                    website_id: selectedValues || [], // Ensure it's an array
                }));
            });
        }

        return () => {
            // Destroy select2 when the component unmounts for Select Website
            if (selectWebsiteRef.current) {
                $(selectWebsiteRef.current).select2('destroy');
            }
        };
    }, [websites]); // Triggered when websites data changes

    useEffect(() => {
        // Initialize select2 for Operations Manager
        if (selectManagerRef.current) {
            $(selectManagerRef.current).select2({
                placeholder: "Select an Operations Manager",
                allowClear: true,
            }).on('change', (e) => {
                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                setFormData((prevData) => ({
                    ...prevData,
                    [e.target.name]: selectedValues,
                }));
            });
        }

        return () => {
            // Destroy select2 when the component unmounts for Operations Manager
            if (selectManagerRef.current) {
                $(selectManagerRef.current).select2('destroy');
            }
        };
    }, [managers]);


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword); // Toggle the visibility
    };

    const handleUsernameCheck = (e) => {
        const username = e.target.value;

        if (username.length > 2) {  // Only check after 3 characters are entered
            fetch('https://99crm.phdconsulting.in/99crmwebapi/api/checkusername', {
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

                case 'username':
                    if (!value.trim() || value.length !== 5) {
                        element.style.border = '2px solid red';
                        toast.error('Username should be 5 characters long');
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

                case 'cpassword':
                    if (value !== formData.password) {
                        element.style.border = '2px solid red';
                        toast.error('Password and Confirm Password must match');
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
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/createuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (response.ok) {
                toast.success('User created successfully!');
                form.reset();
                sessionStorage.removeItem('usersData');
                setTimeout(() => {
                    onClose();
                    after();
                }, 1000)

            } else {
                toast.error('Error creating user: ' + result.message);
                // Handle error (e.g., show error message, etc.)
            }
        } catch (error) {
            toast.error('An error occurred: ' + error.message);
            // Handle network or other errors
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto p-4 "
        >
            <button
                onClick={onClose}
                className="text-white py-2 px-2 rounded-full absolute top-4 right-0 "
            >
                <CircleX className='colorr' size={32} />
            </button>
            <div className="content-wrapper">
                <section className="content-header my-2 text-center">
                    <h1 className='text-2xl font-semibold'>Add New User</h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-6 cent add">
                            <div className="box box-primary">
                                <form onSubmit={handleSubmit} id="user_form" name="user_form" className='space-y-4 p-4 border-t-2 rounded border-blue-400 bg-white shadow-xl'>
                                    <div className="box-body">
                                        <div className="my-2 flex items-center justify-between mb-4">
                                            <div className='col-md-6'>
                                                <label>Name<span className="error">*</span></label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={handleFormDataChange}
                                                />
                                            </div>
                                            <div className='col-md-6'>
                                                <div className='pt-3'>
                                                    <label>Username<span className="error">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="username"
                                                        className="form-control"
                                                        value={formData.username}
                                                        onChange={handleFormDataChange}
                                                        onKeyUp={handleUsernameCheck}
                                                    />
                                                </div>
                                                {usernameStatus && <span className='mt-5'>{usernameStatus}</span>}
                                            </div>
                                        </div>
                                        <div className="my-2 flex items-center justify-between mb-4">
                                            <div className='col-md-6'>
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
                                            <div className='col-md-6'>
                                                <label>Category</label>
                                                <div className="col-md-12 p-1 rounded border d-flex">
                                                    <div className="col-sm-6 rad">
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            id="category1"
                                                            className="flat-red"
                                                            value="PhD"
                                                            checked={formData.category === 'PhD'}
                                                            onChange={handleFormDataChange}
                                                        />
                                                        <label htmlFor="category1">PhD</label>
                                                    </div>
                                                    <div className="col-sm-6 rad">
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            id="category2"
                                                            className="flat-red"
                                                            value="Sales"
                                                            checked={formData.category === 'Sales'}
                                                            onChange={handleFormDataChange}
                                                        />
                                                        <label htmlFor="category2">Sales</label>
                                                    </div>
                                                </div>
                                                <div id="categoryError" className="error"></div>
                                            </div>
                                        </div>

                                        <div className="my-2 flex items-center justify-between">
                                            <div className='col-md-6'>
                                                <label>Confirm Password<span className="error">*</span></label>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="cpassword"
                                                    className="form-control"
                                                    value={formData.cpassword}
                                                    onChange={handleFormDataChange}
                                                />
                                            </div>
                                            <div className='col-md-6'>
                                                <label>Email ID<span className="error">*</span></label>
                                                <input
                                                    type="text"
                                                    name="email_id"
                                                    className="form-control"
                                                    value={formData.email_id}
                                                    onChange={handleFormDataChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="my-2 flex items-center justify-between">
                                            <div className='col-md-6'>
                                                <label>Mobile No.<span className="error">*</span></label>
                                                <input
                                                    type="text"
                                                    name="mobile_no"
                                                    className="form-control"
                                                    value={formData.mobile_no}
                                                    onChange={handleFormDataChange}
                                                />
                                            </div>
                                            <div className='col-md-6'>
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
                                        </div>

                                        {formData.user_type === 'sub-admin' && (
                                            <div className="row form-group">
                                                <div className="col-sm-6">
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
                                        )}


                                        <div className="my-2 flex items-center justify-start space-x-4">
                                            {/* Select Team Section */}
                                            <div
                                                className="w-1/2 mx-2"
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

                                            <div className="w-1/2 mx-2" style={{ display: formData.user_type === 'user' ? 'block' : 'none' }}>
                                                <div className="flex flex-col space-y-2">
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

                                            {formData.user_type === 'Campaign Manager' && (
                                                    <div className="col-sm-6">
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
                                            )}
                                        </div>


                                        <div className="w-full mt-3" style={{
                                            display: (formData.user_type === 'user') ? 'block' : 'none',
                                        }}>
                                            <div className='space-x-2 '>

                                                <div className='flex my-2'>
                                                <div className="w-1/2 mx-1">
                                                    <label>Profile Name</label>
                                                    <input
                                                        type="text"
                                                        name="profile_name"
                                                        className="form-control"
                                                        value={formData.profile_name}
                                                        onChange={handleFormDataChange}
                                                    />
                                                </div>

                                                <div className="w-1/2 mx-1">
                                                    <label>Select Website</label>
                                                    <select
                                                        name="website"
                                                        className="form-control"
                                                        value={formData.website}
                                                        onChange={handleFormDataChange}

                                                    >
                                                        <option value="">Select website</option>
                                                        {websites.map((website) => (
                                                            <option key={website.id} value={website.id}>
                                                                {website.website}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                </div>

                                                <div className='flex my-2'>
                                                <div className="w-1/2 mx-1">
                                                    <label>Website Email</label>
                                                    <input
                                                        type="text"
                                                        name="website_email"
                                                        className="form-control"
                                                        value={formData.website_email}
                                                        onChange={handleFormDataChange}
                                                    />
                                                </div>

                                                <div className="w-1/2 mx-1">
                                                    <label className="font-medium text-gray-700">Signature</label>
                                                    <Editor
                                                        apiKey="2crkajrj0p3qpzebc7qfndt5c6xoy8vwer3qt5hsqqyv8hb8" // Your TinyMCE API Key
                                                        value={formData.signature}
                                                        init={{
                                                            height: 200,
                                                            menubar: false,
                                                            plugins: ['advlist autolink lists link charmap print preview anchor'],
                                                            toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat',
                                                            placeholder: 'Signature',
                                                        }}
                                                        onEditorChange={(content) => handleFormDataChange({ target: { name: 'signature', value: content } })}
                                                    />
                                                </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            type="submit"
                                            onClick={handleSubmit}
                                            className="px-4 py-2 btn btn-success text-white rounded"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
                <ToastContainer />
            </div>
        </motion.div>
    );
};

export default AddUser;
