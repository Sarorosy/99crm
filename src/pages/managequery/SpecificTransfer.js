import React, { useState } from "react";
import toast from "react-hot-toast";

const SpecificTransfer = ({selectedQuery, after, onClose}) => {

    const [crmType, setCrmType] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedProfile, setSelectedProfile] = useState("");
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [users, setUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);

    const handleCrmDropdown = (e) => {
        const selectedOption = e.target.value;
        setCrmType(selectedOption);
        if (selectedOption != "") {
            fetchUsers();
        }
    }
    const fetchUsers = async () => {
        const response = await fetch('https://99crm.phdconsulting.in/zend/api/specificuser', {
            method: 'POST',
            body: JSON.stringify({
                assignType: crmType
            }),
        });
        const data = await response.json();
        if (data.status) {
            setUsers(data.data);
        }

    }

    const handleUserDropdown = (e) => {
        const selectedOption = e.target.value;
        setSelectedUser(selectedOption);
        if (selectedOption != "") {
            fetchProfiles();
        }
    }

    const fetchProfiles = async () => {
        const response = await fetch('https://99crm.phdconsulting.in/zend/99crmwebapi/api/getuserprofiles', {
            method: 'POST',
            body: JSON.stringify({
                user_id: selectedUser
            }),
        });
        const data = await response.json();
        if (data.status) {
            setProfiles(data.data);
        }
    }

    const handleSubmit = async () => {
        try {

            console.log(selectedQuery)
        if(!crmType){
            toast.error("Please select CRM Type");
            return;
        }
        if(!selectedUser){
            toast.error("Please select User");
            return;
        }
        if(!selectedProfile){
            toast.error("Please select Profile");
            return;
        }
        if(!reason){
            toast.error("Please select Reason");
            return;
        }

        const response = await fetch('https://99crm.phdconsulting.in/zend/api/transferspecific', {
            method: 'POST',
            body: JSON.stringify({
                queryIds:selectedQuery,
                specific_crmtype: crmType,
                specific_assign_user_id: selectedUser,
                specific_profile_id: selectedProfile,
                reasons: reason,
                specific_comment: comment,
                creater_id : sessionStorage.getItem("id"),
                creater_name : sessionStorage.getItem("name")
            }),
        });
        const data = await response.json();
        if (data.status) {
            toast.success(data.message || "Transfer Success");
            onClose();
            after();
        }

    } catch (error) {
        console.log(error);
        }
        
    }

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="card bg-light p-3 mb-3">
                    <h5 className="text-primary fw-bold mb-3">Transfer Specific</h5>
                    <div className=" specific_transfer">
                        <div className="qhpage ">
                            <div className="row gap-y-3">
                                <div class="col-3">
                                    <select value={crmType} onChange={handleCrmDropdown} id="specific_crmtype" className="form-select form-select-sm">
                                        <option value="">Select CRM Type</option>
                                        <option value="crmuser">CRM User</option>
                                        <option value="opsuser">OPS User</option>
                                    </select>
                                </div>
                                <div class="col-3">
                                    <select id="specific_assign_user_id" className="form-select form-select-sm" value={selectedUser} onChange={handleUserDropdown}>
                                        <option value="">Select User</option>
                                        {users.map((user, index) => (
                                            <option key={index} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div class="col-3">
                                    <select id="specific_profile_id" className="form-select form-select-sm" value={selectedProfile} onChange={(e) => setSelectedProfile(e.target.value)}>
                                        <option value="">Select Profile</option>
                                        {profiles.map((profile, index) => (
                                            <option key={index} value={profile.id}>{profile.profile_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div class="col-3">
                                    <select id="reasons" className="form-select form-select-sm" value={reason} onChange={(e) => setReason(e.target.value)}>
                                        <option value="">Select Reasons</option>
                                        <option value="CRM is absent">CRM is absent</option>
                                        <option value="Client not interested marked by CRM">Client not interested marked by CRM</option>
                                        <option value="Contact Not Made marked by CRM">Contact Not Made marked by CRM</option>
                                        <option value="CRM Unable to Convert">CRM Unable to Convert</option>
                                    </select>
                                </div>
                                <div class="col-11">
                                    <div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            id="specific_comment"
                                            className="form-control form-control-sm"
                                            placeholder="Enter Comments"
                                            rows="2"
                                        ></textarea>
                                    </div>
                                </div>
                                <div class="col flex align-items-end justify-end">
                                    <button onClick={handleSubmit} className="btn btn-primary btn-sm fw-bold">Transfer</button>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecificTransfer;