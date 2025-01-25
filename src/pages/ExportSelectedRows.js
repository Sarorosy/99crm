import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FileUp } from "lucide-react";
import { ConfirmationModal } from "../components/ConfirmationModal";

const exportSelectedUsers = (selectedUsers, users, clearSelectedUsers) => {
  if (selectedUsers.length === 0) {
    alert("No users selected for export.");
    return;
  }

  console.log("Selected users IDs: ", selectedUsers);

  // Match selectedUsers IDs with the full users list and extract the relevant data
  const data = selectedUsers.map((userId, index) => {
    console.log("Looking for userId: ", userId); // Log the current userId being searched

    const user = users.find((user) => user.id == userId); // Match by userId
    if (user) {
      return {
        "Sr. No.": index + 1,
        Name: user.name,
        Username: user.username,
        Password: user.password,
        "Email ID": user.email_id,
        "Mobile No.": user.mobile_no,
        Status: user.status == 1 ? "Active" : "Inactive",  // Convert status
        "Current Status": user.current_status,
        "Created Date": new Date(user.created_on * 1000).toLocaleDateString(),  // Convert Unix timestamp to human-readable date
      };
    }
    console.log("User not found for ID: ", userId); // Log if user is not found
    return null; // If user is not found, return null (you can handle this case as needed)
  }).filter(user => user !== null);  // Remove null values if any user is not found

  console.log("Data to be exported: ", data);  // Log the final data array

  if (data.length === 0) {
    alert("No matching users found.");
    return;
  }

  // Create a worksheet from the data
  const ws = XLSX.utils.json_to_sheet(data);

  // Adjust column widths for better readability
  const colWidths = [
    { wch: 10 }, // Sr. No.
    { wch: 20 }, // Name
    { wch: 20 }, // Username
    { wch: 20 }, // Password
    { wch: 25 }, // Email ID
    { wch: 15 }, // Mobile No.
    { wch: 15 }, // Status
    { wch: 20 }, 
    { wch: 20 }, // Created Date
  ];
  ws["!cols"] = colWidths;  // Apply the column widths

  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");

  // Write to binary string
  const wbout = XLSX.write(wb, { bookType: "xls", type: "array" });

  // Use FileSaver to save the file
  const blob = new Blob([wbout], { type: "application/vnd.ms-excel" });

  // Set the filename as user_<current_date>.xls
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  saveAs(blob, `user_${dateStr}.xls`);

  // Clear selectedUsers after export
  clearSelectedUsers([]);
};

const ExportButton = ({ selectedUsers, users, clearSelectedUsers }) => {
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  const handleExportClick = () => {
    setShowModal(true); // Show the confirmation modal
  };

  const handleConfirmExport = () => {
    // Proceed with the export if confirmed
    exportSelectedUsers(selectedUsers, users, clearSelectedUsers);
    setShowModal(false); // Hide the modal
  };

  const handleCancelExport = () => {
    setShowModal(false); // Close the modal if canceled
  };

  return (
    <div>
      <button
        onClick={handleExportClick}  // Show the confirmation modal
        className="bg-teal-500 text-white py-1 px-2 rounded hover:bg-teal-600 flex items-center"
      >
        <FileUp className="mr-3" /> Export 
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmationModal
        context={{
            title: "Confirm Export",
            message: `Are you sure you want to export ${selectedUsers.length} user(s)?`,
          }}
          isReversible={true}
          onConfirm={handleConfirmExport}
          onClose={handleCancelExport}
        />
      )}
    </div>
  );
};

export default ExportButton;
