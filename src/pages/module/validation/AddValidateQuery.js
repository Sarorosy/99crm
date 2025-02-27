import React, { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import $ from 'jquery'; // Import jQuery for Select2 initialization
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion } from 'framer-motion';
import { X } from "lucide-react";
import axios from 'axios';

const AddValidateQuery = ({ onClose , finalFunction}) => {

    const entryType = sessionStorage.getItem('category') || '';
    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;

    const [warning, setWarning] = useState('');
    const initialFormData = {
        specific_query_type: "",
        query_code: "",
        name: "",
        email_id: "",
        email_domain: "",
        alt_email_id: "",
        phone: "",
        alt_contact_no: "",
        location: "",
        state: "",
        city: "",
        company_name: "",
        area_of_study: "",
        tags: [],
        team: '',
        allocated_to: '',
        profile_id: '',
        company_id: "",
        website: "",
        requirement: "",
        referred_by: "",
        academic_level: "",
        entry_type: entryType,
        requirement_line: "",
        date: formattedDate,
        paragraph_format: "",
        line_format: "",
        ifCampTag: false,
        withoutemail: false,
        upload_file: [],
        creater_id: sessionStorage.getItem('id'),
        creater_name: sessionStorage.getItem('name'),
        assignType: "",
        assign_user : "",
        sourceoflead : "",
    };
    const [formData, setFormData] = useState({
        specific_query_type: "",
        query_code: "",
        name: "",
        email_id: "",
        email_domain: "",
        alt_email_id: "",
        phone: "",
        alt_contact_no: "",
        location: "",
        state: "",
        city: "",
        company_name: "",
        area_of_study: "",
        tags: [],
        team: '',
        allocated_to: '',
        profile_id: '',
        company_id: "",
        website: "",
        requirement: "",
        referred_by: "",
        academic_level: "",
        entry_type: entryType,
        requirement_line: "",
        date: formattedDate,
        paragraph_format: "",
        line_format: "",
        ifCampTag: false,
        withoutemail: false,
        upload_file: [],
        creater_id: sessionStorage.getItem('id'),
        creater_name: sessionStorage.getItem('name'),
        assignType: "",
        assign_user : "",
        sourceoflead : "",
    });

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [tags, setTags] = useState([]);
    const [querybefore30, setQueryBefore30] = useState([]);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [services, setServices] = useState([]);
    const [fileInputs, setFileInputs] = useState([{ id: 1 }]);
    const [errorData, setErrorData] = useState("");
    const [opsusers, setOpsUsers] = useState([]);


    const [isPhD, setIsPhD] = useState(false);

    const queryCodes = [
        "GH56671",
        "654QTYP",
        "C9-987-EE",
        "7651/09/7145",
        "15:98716",
        "E3W33BS",
        "AG6521",
        "F3485TK",
    ];


    useEffect(() => {
        // Set PhD status from sessionStorage
        const userCategory = sessionStorage.getItem("category");
        setIsPhD(userCategory == "PhD");

        fetchLocations();
        fetchTags();
        fetchCompanies();
        fetchServices();
        fetchQueryBefore30();
        fetchTeams();
        fetchPriorities();
    }, []);
    const locationRef = useRef(null);
    const stateRef = useRef(null);
    const cityRef = useRef(null);
    const websiteRef = useRef(null);
    const serviceRef = useRef(null);
    const tagsRef = useRef(null);

    const fetchOpsUsers = async () => {
        const response = await axios.post('https://99crm.phdconsulting.in/api/teampresentuser', {
            team_id: "opsuser",
            assignType: "opsuser"
        });
        if (response.data.status) {
            setOpsUsers(response.data.data);
        } else {
            console.error('Error fetching users:', response.data.message);
        }
    }
    const handleOpsUserChange = (e) => {
        const selectedOpsUser = $(e.target).val();
        setFormData({ ...formData, assignType: selectedOpsUser });
        fetchOpsUsers();
    }

    useEffect(() => {
        // Initialize select2 for Select Location
        $(locationRef.current).select2({
            placeholder: "Select a Location",
            allowClear: true,
        }).on('change', handleLocationChange);

        return () => {
            // Destroy select2 and cleanup when component unmounts
            if (locationRef.current) {
                $(locationRef.current).select2('destroy').off('change', handleLocationChange);
            }
        };
    }, [countries]);

    useEffect(() => {
        // Initialize select2 for Select Location
        $(stateRef.current).select2({
            placeholder: "Select State",
            allowClear: true,
        }).on('change', handleStateChange);

        return () => {
            // Destroy select2 and cleanup when component unmounts
            if (stateRef.current) {
                $(stateRef.current).select2('destroy').off('change', handleStateChange);
            }
        };
    }, [states]);

    useEffect(() => {
        // Initialize select2 for Select City
        $(cityRef.current).select2({
            placeholder: "Select City",
            allowClear: true,
        }).on('change', handleCityChange);

        return () => {
            // Destroy select2 and cleanup when component unmounts
            if (cityRef.current) {
                $(cityRef.current).select2('destroy').off('change', handleCityChange);
            }
        };
    }, [cities]);

    const handleCityChange = (e) => {
        const selectedCity = $(e.target).val(); // Get selected city
        setFormData({ ...formData, city: selectedCity }); // Update form data with selected city
    };

    useEffect(() => {
        // Initialize select2 for Select City
        $(websiteRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
        }).on('change', handleWebsiteChange);

        return () => {
            // Destroy select2 and cleanup when component unmounts
            if (websiteRef.current) {
                $(websiteRef.current).select2('destroy').off('change', handleWebsiteChange);
            }
        };
    }, [websites]);

    const handleWebsiteChange = (e) => {
        const selectedWebsite = $(e.target).val(); // Get selected city
        setFormData({ ...formData, website: selectedWebsite }); // Update form data with selected city
    };

    useEffect(() => {
        // Initialize select2 for Select City
        $(serviceRef.current).select2({
            placeholder: "Select Requirement",
            allowClear: true,
        }).on('change', handleServiceChange);

        return () => {
            // Destroy select2 and cleanup when component unmounts
            if (serviceRef.current) {
                $(serviceRef.current).select2('destroy').off('change', handleServiceChange);
            }
        };
    }, [websites]);

    const handleServiceChange = (e) => {
        const selectedService = $(e.target).val(); // Get selected city
        setFormData((prevData) => ({
            ...prevData,
            requirement: selectedService,
        }));
    };

    useEffect(() => {
        // Initialize select2 for Select Team
        $(tagsRef.current).select2({
            placeholder: "Select Tags",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val(); // Use select2's value retrieval method
            console.log("Selected tags:", selectedValues);
            setFormData((prevData) => ({
                ...prevData,
                tags: selectedValues || [], // Ensure it's an array
            }));
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (tagsRef.current) {
                $(tagsRef.current).select2('destroy');
            }
        };
    }, [tags]);


    const fetchLocations = async () => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/country');
            const data = await response.json();
            if (data.status) {
                setCountries(data.data); // Assuming data.data contains the companies
            } else {
                console.error('Failed to fetch companies');
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch("https://99crm.phdconsulting.in/99crmwebapi/api/tags");
            const data = await response.json();
            if (data.status) {
                setTags(data.data);
            } else {
                console.error('Failed to fetch companies');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/companies');
            const data = await response.json();
            if (data.status) {
                setCompanies(data.data); // Assuming data.data contains the companies
            } else {
                console.error('Failed to fetch companies');
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch("https://99crm.phdconsulting.in/99crmwebapi/api/getallcategoryservices/" + sessionStorage.getItem("category"));
            const data = await response.json();
            if (data.status) {
                setServices(data.data);
            } else {
                console.error('Failed to fetch services');
            }
        } catch (err) {
            console.error(err);
        }
    };
    const fetchQueryBefore30 = async () => {
        try {
            const response = await fetch("https://99crm.phdconsulting.in/99crmwebapi/api/getallsearchquery/");
            const data = await response.json();
            if (data.status) {
                setQueryBefore30(data.data);
            } else {
                console.error('Failed to fetch querybefore30');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeams = async () => {
        try {
            // Retrieve the 'team_id' from sessionStorage (comma-separated values)
            const teamIds = sessionStorage.getItem('team_id');

            // If no team_id is found in sessionStorage, log an error and return
            if (!teamIds) {
                console.error('No team IDs found in sessionStorage');
                return;
            }

            // Prepare the payload with team_ids as input
            const payload = {
                team_id: teamIds,
            };

            // Make the POST request with the 'team_id' in the body
            const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/teamsbyids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Ensure the request is sent as JSON
                },
                body: JSON.stringify(payload), // Stringify the payload object
            });

            // Parse the response
            const data = await response.json();

            if (data.status) {
                setTeams(data.data)
            } else {
                console.error('Failed to fetch teams:', data.message);
            }
        } catch (err) {
            console.error('Error fetching teams:', err);
        }
    };
    const fetchPriorities = async () => {
        try {
            const response = await fetch("https://99crm.phdconsulting.in/99crmwebapi/api/getfollowupsetting");
            const data = await response.json();
            if (data.status) {
                setPriorities(data.data);
            } else {
                console.error('Failed to fetch priorities');
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === "checkbox" ? !prevState.withoutemail : value, // Toggle the checkbox value
        }));
    };


    const handleEmailIdChange = (e) => {
        const emailIdInput = e.target.value;
        let emailId = emailIdInput.trim();

        // If email has a domain part (e.g., user@domain.com), remove it
        if (emailId.includes('@')) {
            emailId = emailId.split('@')[0];
        }

        // Update the email_id without domain part
        setFormData({
            ...formData,
            email_id: emailId,
        });
    };

    const handleLocationChange = async (e) => {
        const location = $(e.target).val();
        setFormData((prevFormData) => ({
            ...prevFormData,
            location,
        }));

        // Fetch states based on location
        const countryId = countries.find((country) => country.nicename == location)?.id;
        if (countryId) {
            try {
                const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/states/${countryId}`);
                const data = await response.json();
                setStates(data.data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleStateChange = async (e) => {
        const state = $(e.target).val();
        console.log("state" + state)
        setFormData((prevFormData) => ({
            ...prevFormData, // spread the previous state to keep other fields intact
            state, // only update the location field
        }));

        // Fetch cities based on state
        const stateId = states.find((stateItem) => stateItem.id == state)?.id;
        if (stateId) {
            try {
                const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/cities/${stateId}`);
                const data = await response.json();
                setCities(data.data);
            } catch (err) {
                console.error(err);
            }
        }
    };
    const handleCompanyChange = async (e) => {
        const companyId = e.target.value; // Get the selected company's ID
        setFormData({ ...formData, company_id: companyId });

        if (companyId) {
            try {
                const response = await fetch(`https://99crm.phdconsulting.in/99crmwebapi/api/getwebsitebycompanyid/${companyId}`);
                if (response.ok) {
                    const data = await response.json();
                    setWebsites(data.data || []); // Update websites if data exists
                } else {
                    console.error(`Error fetching websites: ${response.statusText}`);
                }
            } catch (err) {
                console.error("Error fetching websites:", err);
            }
        } else {
            setWebsites([]); // Reset websites if no company selected
        }
    };




    const handleFileChange = (e, index) => {
        const files = e.target.files;
        const newUploadFile = [...formData.upload_file];

        if (files.length > 0) {
            newUploadFile[index] = files; // Store the file array at the corresponding index
        } else {
            newUploadFile[index] = []; // Handle case when no file is selected
        }

        setFormData({ ...formData, upload_file: newUploadFile });
    };



    // Add a new file input field
    const handleAddFileInput = () => {
        setFileInputs([...fileInputs, { id: fileInputs.length + 1 }]);
    };

    // Remove a file input field
    const handleRemoveFileInput = (index) => {
        const newFileInputs = [...fileInputs];
        newFileInputs.splice(index, 1);

        const newUploadFile = [...formData.upload_file];
        newUploadFile.splice(index, 1); // Remove the corresponding file

        setFileInputs(newFileInputs);
        setFormData({ ...formData, upload_file: newUploadFile });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error("Please enter the client's name!");
            return;
        }

        if (!formData.withoutemail) {
            if (!formData.email_id) {
                toast.error("Please provide an email ID!");
                return;
            }

            if (!formData.email_domain) {
                toast.error("Please provide an email domain!");
                return;
            }
        }

        if (!formData.company_id) {
            toast.error("Please provide the company name!");
            return;
        }

        if (!formData.website) {
            toast.error("Please provide the company website!");
            return;
        }

        if (!formData.requirement) {
            toast.error("Please select a service!");
            return;
        }

        if (!formData.priority) {
            toast.error("Please select a priority level!");
            return;
        }
        if(!formData.assignType){
            toast.error("Please select a user type!");
            return;
        }
        if(!formData.assign_user){
            toast.error("Please select a user!");
            return;
        }
        if(!formData.sourceoflead){
            toast.error("Please select a source of lead!");
            return;
        }
        if(!formData.requirement_line){
            toast.error("Please select a requirement line!");
            return;
        }
        if(formData.requirement_line == "1" && !formData.line_format ){
            toast.error("Please Enter line format!");
            return;
        }
        if(formData.requirement_line == "2" && !formData.paragraph_format){
            toast.error("Please Enter paragraph format!");
            return;
        }
        const formDataToSubmit = new FormData();

        // Only append specified fields
        const fieldsToInclude = {
            entrytype: formData.entry_type,
            date: formData.date,
            query_code: formData.query_code,
            name: formData.name,
            email_id: formData.email_id,
            email_domain: formData.email_domain,
            alt_email_id: formData.alt_email_id,
            phone: formData.phone,
            alt_contact_no: formData.alt_contact_no,
            location: formData.location,
            city: formData.city,
            company_name: "", // Empty string as specified
            area_of_study: formData.area_of_study,
            company_id: formData.company_id,
            website: formData.website,
            other_website: "", // Empty string as specified
            requirement: formData.requirement,
            other_requirement: "", // Empty string as specified
            priority: formData.priority,
            assignType: formData.assignType,
            allocated_to: formData.assign_user, // Using assign_user as allocated_to
            academic_level: formData.academic_level,
            sourceoflead: formData.sourceoflead,
            requirement_line: formData.requirement_line,
            line_format: formData.line_format,
            _wysihtml5_mode: "1",
            paragraph_format: formData.paragraph_format,
            submitBtn: "Submit",
            post_user_id : sessionStorage.getItem('id')
        };

        // Append all specified fields
        Object.entries(fieldsToInclude).forEach(([key, value]) => {
            formDataToSubmit.append(key, value || ""); // Ensure empty string if value is null/undefined
        });

        // Handle file uploads separately
        if (formData.upload_file && formData.upload_file.length > 0) {
            formData.upload_file.forEach((files, index) => {
                if (files && files.length > 0) {
                    formDataToSubmit.append(`upload_file[]`, files[0]);
                }
            });
        }

        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/addvalidation", {
                method: "POST",
                body: formDataToSubmit,
            });

            

            const data = await response.json();
            if(data.status && !data.warning){
                toast.success( data.message || "Query added successfully!");
                setFormData(initialFormData);
                onClose();
                finalFunction();

            }else if(data.warning){
                setWarning(data.message);
            }else{
                toast.error(data.message || "Query submission failed!");
            }

            

        } catch (error) {
            console.error("Error submitting query:", error);
            toast.error("An unexpected error occurred. Please try again!");
        }
    };



    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-50 shadow-md z-50 overflow-y-auto "
        >
            <div className='flex items-center justify-between py-3 px-2 bg-[#cfe1e5] text-[#02313a]'>
                <h1 className='text-md font-bold'>Add New Validation Query</h1>
                <button onClick={onClose} className='bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-2 flex items-center text-sm' style={{ fontSize: "12px !important" }}>
                    <X size={16} />
                </button>
            </div>

            <div className="flex w-full h-full overflow-y-auto custom-scrollbar items-start justify-center space-x-2 mt-4 ">
                <form encType="multipart/form-data" className="space-y-4 p-4 border-t-2 rounded border-green-400 bg-white shadow-xl w-3/4 qhpage" autoComplete="off">
                    {warning && warning != '' && (
                        <div className="bg-yellow-200 text-yellow-600 px-4 py-1 rounded">
                            <div dangerouslySetInnerHTML={{ __html: warning }} />
                        </div>
                    )}

                    <div className="row form-group anq">

                        <div className="col-sm-4">
                            <label htmlFor="query_code">Query Code<span className="error">*</span></label>
                            <select
                                name="query_code"
                                id="query_code"
                                className="form-control"
                                value={formData.query_code}
                                onChange={handleChange}
                            >
                                <option value="">Select Query Code</option>
                                {queryCodes.map((code) => (
                                    <option key={code} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-sm-4">
                            <div className="form-group" style={{ marginTop: "23px", display: "flex", alignItems: "center" }}>
                                <input
                                    type="checkbox"
                                    name="withoutemail"
                                    id="withoutemail"
                                    checked={formData.withoutemail}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            withoutemail: e.target.checked
                                        });
                                    }}
                                />
                                <label htmlFor="withoutemail" style={{ marginLeft: "8px", marginTop: "0" }}> Add Without Email</label>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Client Email Inputs */}
                    <div className="row form-group mt-0 anq">
                        <div className="col-sm-4">
                            <label htmlFor="name">Client Name<span className="error">*</span></label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                className="form-control"
                                onChange={handleChange}
                            />
                        </div>
                        {!formData.withoutemail && (
                            <>
                                <div className="col-sm-4">
                                    <label htmlFor="email_id">Client Email ID<span className="error">*</span></label>
                                    <input
                                        type="text"
                                        name="email_id"
                                        id="email_id"
                                        value={formData.email_id}
                                        className="form-control"
                                        onChange={handleEmailIdChange}

                                    />
                                </div>
                                <div className="col-sm-4">
                                    <label htmlFor="email_domain">Email Domain</label>
                                    <select
                                        className="form-control"
                                        name="email_domain"
                                        id="email_domain"
                                        value={formData.email_domain}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Domain</option>
                                        <option value="gmail.com">gmail.com</option>
                                        <option value="yahoo.com">yahoo.com</option>
                                        <option value="hotmail.com">hotmail.com</option>
                                        <option value="yahoo.co.in">yahoo.co.in</option>
                                        <option value="rediffmail.com">rediffmail.com</option>
                                        <option value="other">other</option>
                                    </select>
                                </div>
                                <div className="col-sm-4">
                                    <label htmlFor="alt_email_id">Alternate Email ID</label>
                                    <input
                                        type="email"
                                        name="alt_email_id"
                                        id="alt_email_id"
                                        value={formData.alt_email_id}
                                        className="form-control"
                                        onChange={handleChange}
                                    />
                                </div>

                            </>
                        )}

                        <div className="col-sm-4">
                            <label htmlFor="phone">Contact No.</label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                value={formData.phone}
                                className="form-control"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-sm-4">
                            <label htmlFor="alt_contact_no">Alternate Contact Number</label>
                            <input
                                type="text"
                                name="alt_contact_no"
                                id="alt_contact_no"
                                value={formData.alt_contact_no}
                                className="form-control"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="area_of_study">Topic/Area of Study</label>
                            <input
                                type="text"
                                name="area_of_study"
                                id="area_of_study"
                                value={formData.area_of_study}
                                className="form-control"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="location">Location</label>
                            <select
                                name="location"
                                id="location"
                                className="form-control select2"
                                value={formData.location}
                                //onChange={handleLocationChange}
                                ref={locationRef}
                            >
                                <option value="">Please Select</option>
                                {countries.map((country) => (
                                    <option key={country.id} value={country.nicename}>
                                        {country.nicename}
                                    </option>
                                ))}
                            </select>
                        </div>



                        <div className="col-sm-4">
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                name="city"
                                id="city"
                                className="form-control"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Enter City"
                            />
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="company_id">Company</label>
                            <select
                                name="company_id"
                                id="company_id"
                                className="form-control"
                                value={formData.company_id}
                                onChange={handleCompanyChange}
                            >
                                <option value="">Select Company</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.company_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="website">Website</label>
                            <select
                                name="website"
                                id="website"
                                className="form-control select2"
                                value={formData.website}
                                ref={websiteRef}
                            >
                                <option value="">Please Select</option>
                                {websites.map((website) => (
                                    <option key={website.id} value={website.id}>
                                        {website.website}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="requirement">Service</label>
                            <select
                                name="requirement"
                                id="requirement"
                                className="form-control select2"
                                value={formData.requirement}
                                ref={serviceRef}
                            >
                                <option value="">Please Select</option>
                                {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="assignType">Assign User Type</label>
                            <select
                                className="form-control"
                                name="assignType"
                                id="assignType"
                                value={formData.assignType}
                                onChange={handleOpsUserChange}
                            >
                                <option value="">Select Assign Type</option>
                                <option value="opsuser">OPS User</option>
                            </select>
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="assign_user">Assign User</label>
                            <select
                                name="assign_user"
                                id="assign_user"
                                className="form-control select2"
                                value={formData.assign_user}
                                onChange={handleChange}
                            >
                                <option value="">Please Select</option>
                                {opsusers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="priority">Select Priority</label>
                            <select
                                name="priority"
                                id="priority"
                                className="form-control select2"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option value="">Please Priority</option>
                                {priorities.map((priority) => (
                                    <option key={priority.id} value={`${priority.priority}|${priority.follow_up_day}|${priority.contact_by}`}>
                                        {priority.priority}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="academic_level">Academic Level</label>
                            <select
                                className="form-control"
                                name="academic_level"
                                id="academic_level"
                                value={formData.academic_level}
                                onChange={handleChange}
                            >
                                <option value="">Select Academic Level</option>
                                <option value="PHD">PHD</option>
                                <option value="Masters">Masters</option>
                                <option value="Bachelors">Bachelors</option>
                            </select>
                        </div>

                        <div className="col-sm-4 flex items-center flex-col" style={{ marginTop: "24px" }}>
                            {fileInputs.map((input, index) => (
                                <div className="row flex items-center mb-1" key={input.id} >
                                    <div className="col-md-11">
                                        <input
                                            type="file"
                                            className="form-control"
                                            name={`upload_file[${index}]`}
                                            id={`upload_file${input.id}`}
                                            onChange={(e) => handleFileChange(e, index)}
                                        />
                                    </div>
                                    <div className="col-md-1">
                                        {index === 0 ? (
                                            <i
                                                style={{ fontSize: "14px", cursor: "pointer", color: "green", marginLeft: "-15px" }}
                                                className="fa fa-plus-circle"
                                                onClick={handleAddFileInput}
                                            ></i>
                                        ) : (
                                            <i
                                                style={{ fontSize: "14px", cursor: "pointer", color: "red", marginLeft: "-15px" }}
                                                className="fa fa-minus-circle"
                                                onClick={() => handleRemoveFileInput(index)}
                                            ></i>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="col-sm-4">
                        <label htmlFor="sourceoflead">Source of Lead</label>
                            <select value={formData.sourceoflead} onChange={handleChange} name="sourceoflead" id="sourceoflead" class="form-control " tabindex="-1" aria-hidden="true">
                                <option value="">Please select</option>
                                <option value="100">Google</option>
                                <option value="200">FB</option>
                                <option value="300">Mailer Campaign</option>
                                <option value="400">Interakt Campaign</option>
                                <option value="500">Through call</option>
                                <option value="600">Through Whatsapp</option>
                            </select>
                        </div>

                        <div className="col-sm-4">
                            <label htmlFor="requirement_line">Requirement</label>
                            <select
                                className="form-control"
                                name="requirement_line"
                                id="requirement_line"
                                value={formData.requirement_line}
                                onChange={handleChange}
                            >
                                <option value="">Select Requirement</option>
                                <option value="2">Paragraph Format</option>
                                <option value="1">Line Format</option>
                            </select>
                        </div>

                        {formData.requirement_line && formData.requirement_line == 1 && (
                            <div className="col-sm-12 mt-3">
                                <label className="font-medium text-gray-700">Line Format</label>
                                <ReactQuill
                                    value={formData.line_format}
                                    onChange={(content) => handleChange({ target: { name: 'line_format', value: content } })}
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
                                    style={{ height: 200 }}
                                    placeholder="Line Format"
                                />
                            </div>
                        )}
                        {formData.requirement_line && formData.requirement_line == 2 && (
                            <div className="col-sm-12 mt-3">
                                <label className="font-medium text-gray-700">Paragraph Format</label>
                                <textarea
                                    name="paragraph_format"
                                    value={formData.paragraph_format}
                                    onChange={handleChange}
                                    placeholder="Enter paragraph content"
                                    rows="4"
                                    className="form-control"
                                />
                            </div>
                        )}

                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                className="bg-blue-500 text-white py-1 px-2 rounded flex items-center"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>

        </motion.div>
    );
};

export default AddValidateQuery;
