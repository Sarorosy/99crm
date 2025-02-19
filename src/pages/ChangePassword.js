import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setMessage("New password and confirm password do not match.");
            return;
        }
        
        try {
            const response = await axios.post("https://99crm.phdconsulting.in/api/changepassword/", {
                old_password: oldPassword,
                new_password: newPassword,
                user_id: sessionStorage.getItem("id")
            });
            
            if (response.data.status) {
                toast.success("Password changed successfully.");
                setMessage("");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage(response.data.message || "Failed to change password.");
            }
        } catch (error) {
            setMessage("An error occurred while changing the password.");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-5 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Change Password</h2>
            {message && (
                <p className=" my-4 text-sm text-center font-medium text-red-600">
                    {message}
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Old Password:</label>
                    <input 
                        type="password" 
                        value={oldPassword} 
                        onChange={(e) => setOldPassword(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">New Password:</label>
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm Password:</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-[#257180] text-white py-2 px-4 rounded-md  transition-colors duration-200"
                >
                    Change Password
                </button>
            </form>
            
        </div>
    );
};

export default ChangePassword;
