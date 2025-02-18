import React, { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { Editor } from '@tinymce/tinymce-react';
import $ from 'jquery'; // Import jQuery for Select2 initialization
import 'select2/dist/css/select2.min.css'; // Import Select2 CSS
import 'select2';
import AddQuerySideDetails from "./AddQuerySideDetails";


const ImportQuery = () => {

    const entryType = sessionStorage.getItem('category') || '';
    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    const today = new Date().toISOString().split('T')[0]; 
    const initialFormData = {
        team: '',
        allocated_to: '',
        profile_id: '',
        priority : "",
        import_csv_file: [],
        creater_id: sessionStorage.getItem('id'),
        creater_name: sessionStorage.getItem('name'),
        date: today, // Add today's date
        entrytype: sessionStorage.getItem('category')
    };
    const [formData, setFormData] = useState({
        team: '',
        allocated_to: '',
        profile_id: '',
        priority: "",
        import_csv_file: [],
        creater_id: sessionStorage.getItem('id'),
        creater_name: sessionStorage.getItem('name'),
        date: today, // Add today's date
        entrytype: sessionStorage.getItem('category')
    });

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [allocatedUsers, setAllocatedUsers] = useState([]);
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

    const [isPhD, setIsPhD] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    
    useEffect(() => {
        console.log(formData);  // This will log the updated value after state change
    }, [formData]);

    useEffect(() => {
        // Set PhD status from sessionStorage
        const userCategory = sessionStorage.getItem("category");
        setIsPhD(userCategory == "PhD");

        fetchTeams();
        fetchPriorities();
    }, []);

    
    const teamRef = useRef(null);
    const allocatedRef = useRef(null);
    const profileRef = useRef(null);
    

   

    useEffect(() => {
        // Initialize select2 for Select Location
        $(teamRef.current).select2({
            placeholder: "Select a Team",
            allowClear: true,
        }).on('change', handleTeamChange);

        return () => {
            // Destroy select2 and cleanup when component unmounts
            if (teamRef.current) {
                $(teamRef.current).select2('destroy').off('change', handleTeamChange);
            }
        };
    }, [teams]);

    useEffect(() => {
        // Initialize select2 for Select Location
        $(allocatedRef.current).select2({
            placeholder: "Select Allocated User",
            allowClear: true,
        }).on('change', handleUserChange);

        return () => {
            // Destroy select2 and cleanup when component unmounts
            if (allocatedRef.current) {
                $(allocatedRef.current).select2('destroy').off('change', handleUserChange);
            }
        };
    }, [allocatedUsers]);

    useEffect(() => {
        // Initialize select2 for Select City
        $(profileRef.current).select2({
            placeholder: "Select Profile",
            allowClear: true,
        }).on('change', handleProfileChange);

        return () => {
            // Destroy select2 and cleanup when component unmounts
            if (profileRef.current) {
                $(profileRef.current).select2('destroy').off('change', handleProfileChange);
            }
        };
    }, [profiles]);

    const handleProfileChange = (e) => {
        const selectedCity = $(e.target).val(); // Get selected city
        setFormData({ ...formData, profile_id: selectedCity }); // Update form data with selected city
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


   

    const handleTeamChange = async (e) => {
        const team = $(e.target).val();
        setFormData((prevFormData) => ({
            ...prevFormData,
            team,
        }));
        console.log("Teams Array:", teams);

        // Fetch states based on team
        const teamId = teams.find((t) => t.id === team)?.id;
        if (teamId) {
            try {
                const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getallusersbyteamid/',{
                 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ team_id: teamId }), // Send selected team_id
                  
                });
                const data = await response.json();
                setAllocatedUsers(data.data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleUserChange = async (e) => {
        const allocated_to = $(e.target).val();
        
        // Update `allocated_to` in the form data
        setFormData((prevFormData) => ({
            ...prevFormData,
            allocated_to,
        }));
    
        // Fetch profiles based on the selected user
        const selectedUser = allocatedUsers.find((user) => user.id == allocated_to);
        if (selectedUser) {
            try {
                const response = await fetch('https://99crm.phdconsulting.in/99crmwebapi/api/getuserprofiles/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user_id: selectedUser.id }),
                });
    
                const data = await response.json();
                
                if (data.data) {
                    
                    setProfiles(data.data); // Update profiles state
                } else {
                    setProfiles([]); // Reset profiles if the fetch fails
                }
            } catch (err) {
                console.error("Error fetching profiles:", err);
            }
        } else {
            console.error("Selected user not found in allocatedUsers.");
            
        }
    };
  
    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Get the first file
    
        setFormData({
            ...formData,
            import_csv_file: file, // Store the single file
        });
    };
    


    // Add a new file input field
    const handleAddFileInput = () => {
        setFileInputs([...fileInputs, { id: fileInputs.length + 1 }]);
    };

    // Remove a file input field
    const handleRemoveFileInput = (index) => {
        const newFileInputs = [...fileInputs];
        newFileInputs.splice(index, 1);

        const newUploadFile = [...formData.import_csv_file];
        newUploadFile.splice(index, 1); // Remove the corresponding file

        setFileInputs(newFileInputs);
        setFormData({ ...formData, import_csv_file: newUploadFile });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        setButtonDisabled(true);

        // Validate required fields one by one and show individual toasts
        if (!formData.team) {
            toast.error("Please select a Team!");
            setButtonDisabled(false)
            return;
        }

        if (!formData.allocated_to) {
            toast.error("Please select a User!");
            setButtonDisabled(false)
            return;
        }

        

        if (!formData.profile_id) {
            toast.error("Please select a User profile!");
            setButtonDisabled(false)
            return;
        }

        if (!formData.priority) {
            toast.error("Please provide the company website!");
            setButtonDisabled(false)
            return;
        }

        if (!formData.import_csv_file) {
            toast.error("Please select a file to import!");
            setButtonDisabled(false)
            return;
        }


        const formDataToSubmit = new FormData();

        // Append other form fields dynamically
        for (let key in formData) {
            if (formData.hasOwnProperty(key)) {
                const value = formData[key];

                // Check if the value is an array (for file inputs or multiple values)
                if (Array.isArray(value)) {
                    value.forEach((file, index) => {
                        if (file) {
                            // For file inputs, append each file in the array
                            formDataToSubmit.append(`${key}[${index}]`, file);
                        }
                    });
                } else {
                    // Append regular fields or non-array values
                    formDataToSubmit.append(key, value);
                }
            }
        }

        // Construct the API URL
        const apiUrl = "https://99crm.phdconsulting.in/api/importquery";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                body: formDataToSubmit,
            });

        
            

            const data = await response.json();

            if (data.status) {
                toast.success(data.message)
                setFormData(initialFormData); 
            } else {
                
                toast.error(`${data.message || "Submission failed!"}`);
            }  

            

        } catch (error) {
            console.error("Error submitting query:", error);
            toast.error("An unexpected error occurred. Please try again!");
        }finally{
            setButtonDisabled(false)
        }
    };



    return (
        <div className="container">
            <h1 className='text-md text-center font-bold mt-2'>Import Query</h1>
            
            <div className="flex w-full items-start justify-center space-x-2 mt-4">
                <form encType="multipart/form-data" className="space-y-4 p-4 border-t-2 rounded border-green-400 bg-white shadow-xl iqw" autoComplete="off">
                    {errorData && errorData != '' && (
                        <div className="bg-yellow-200 text-yellow-600 px-4 py-1 rounded">
                            <div dangerouslySetInnerHTML={{ __html: errorData }} />
                        </div>
                    ) }

                    

                    {/* Conditional Client Email Inputs */}
                    <div className="row form-group qhpage">
                       
                        <div className="col-sm-12">
                            <label htmlFor="location">Select Team</label>
                            <select
                                name="team"
                                id="team"
                                className="form-control select2"
                                value={formData.team}
                                 ref={teamRef}
                            >
                                <option value="">Please Select</option>
                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.team_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-sm-12 mt-3">
                            <label htmlFor="state">Allocated to</label>
                            <select
                                name="allocated_to"
                                id="allocated_to"
                                className="form-control select2"
                                value={formData.allocated_to}
                                ref={allocatedRef}
                            >
                                <option value="">Select Allocated To</option>
                                {allocatedUsers && allocatedUsers != null && allocatedUsers != '' && allocatedUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-sm-12 mt-3">
                            <label htmlFor="city">Profile</label>
                            <select
                                name="profile_id"
                                id="profile_id"
                                className="form-control select2"
                                value={formData.profile_id}
                                //ref={profileRef}
                             onChange={handleChange}
                            >
                                <option value="">Select Profile</option>
                                {profiles.map((profile) => (
                                    <option key={profile.id} value={profile.name}>
                                        {profile.profile_name}
                                    </option>
                                ))}
                            </select>
                        </div>                        
                        <div className="col-sm-12 mt-3">
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
                        <div className="col-sm-12 mt-4">
                            {fileInputs.map((input, index) => (
                                <div className="flex items-center" key={input.id} >
                                    {/* <div className="w-3/4"> */}
                                        <input
                                            type="file"
                                            className="form-control"
                                            name={`import_csv_file[${index}]`}
                                            id={`import_csv_file${input.id}`}
                                            onChange={(e) => handleFileChange(e, index)}
                                        />
                                    {/* </div> */}

                                    {/* <div className="w-1/4">
                                        {index === 0 ? (
                                            <i
                                                style={{ fontSize: "20px", cursor: "pointer" }}
                                                className="fa fa-plus-circle"
                                                onClick={handleAddFileInput}
                                            ></i>
                                        ) : (
                                            <i
                                                style={{ fontSize: "20px", cursor: "pointer", color: "red" }}
                                                className="fa fa-minus-circle"
                                                onClick={() => handleRemoveFileInput(index)}
                                            ></i>
                                        )}
                                    </div> */}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={buttonDisabled}
                                className="bg-blue-500 text-white py-1 px-2 rounded flex items-center"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
                <div>
                    <AddQuerySideDetails TodayCreatedQuery ={0}/>
                </div>
            </div>
           
        </div>
    );
};

export default ImportQuery;