// AssignQueryCampaignModal.js

import React, { useState } from "react";
import toast from 'react-hot-toast';

const AssignQueryCampaignModal = ({
  onClose,
  selectedQueries,     
  selectedCampaignUser,  
  websites             
}) => {
  // Form state
  const [campTitle, setCampTitle] = useState("");
  const [campDate, setCampDate] = useState(""); 
  const [campWebsite, setCampWebsite] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      queryIds: selectedQueries, 
      campaign_user_id: selectedCampaignUser, 
      camp_title: campTitle,
      camp_date: campDate,  
      camp_website: campWebsite 
    };

    try {
      const response = await fetch("https://99crm.phdconsulting.in/api/assign-query-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Campaign assigned successfully!");
        // Optionally clear the form (if needed)
        setCampTitle("Testing Campaign");
        setCampDate("");
        setCampWebsite("");
        onClose(); // Close the modal on success
      } else {
        toast.error(data.message || "Failed to assign campaign. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while assigning the campaign.");
      console.error("Error:", error);
    }
  };



  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Modal Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Modal Container */}
      <div className="bg-white rounded-lg shadow-lg z-50 p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Assign Query Campaign</h2>
        <form onSubmit={handleSubmit}>
          {/* Campaign Title */}
          <div className="mb-4">
            <label className="block mb-1">Campaign Title</label>
            <input
              type="text"
              value={campTitle}
              onChange={(e) => setCampTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Testing Campaign"
            />
          </div>

          {/* Campaign Date */}
          <div className="mb-4">
            <label className="block mb-1">Campaign Date</label>
            <input
              type="date"
              value={campDate}
              onChange={(e) => setCampDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Campaign Website Dropdown */}
          <div className="mb-4">
            <label className="block mb-1">Campaign Website</label>
            <select
              value={campWebsite}
              onChange={(e) => setCampWebsite(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Website</option>
              {websites.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.website}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded"
            >
              Assign Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignQueryCampaignModal;
