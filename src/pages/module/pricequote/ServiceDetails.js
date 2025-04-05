import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ServiceDetails = ({ serviceId, onClose, serviceInfo, serviceMilestoneData, after , finalFunction,  EditAndAddServicePrice}) => {
    const [showEditServiceAmount, setShowEditServiceAmount] = useState(false);
    const [showEditExpiryDate, setShowEditExpiryDate] = useState(false);
    const [editServiceAmount, setEditServiceAmount] = useState(serviceInfo.total_price || '');
    const [editExpiryDate, setEditExpiryDate] = useState(
        serviceInfo.expiry_date ? new Date(serviceInfo.expiry_date * 1000).toLocaleDateString('en-US') : ''
    );
    const [milestonesToEdit, setMilestonesToEdit] = useState({});

    // Parse JSON strings to objects
    const uploadFileArr = serviceInfo.upload_file ? JSON.parse(serviceInfo.upload_file) : {};
    const extraFile = serviceInfo.document_file ? JSON.parse(serviceInfo.document_file) : {};
    const selectedPlans = serviceInfo.select_plan ? serviceInfo.select_plan : '';
    const decodedPlans = serviceInfo.select_plan ? JSON.parse(serviceInfo.select_plan) : null;
    const multiplans = Array.isArray(decodedPlans) ? 1 : 0;
    const recommendedPlan = serviceInfo.recommended_plan || '';

    // Group milestones by plan_type
    const groupMilestonesByPlanType = () => {
        const groupedMilestones = {};

        serviceMilestoneData.forEach(milestone => {
            const planType = milestone.plan_type || 'default';
            if (!groupedMilestones[planType]) {
                groupedMilestones[planType] = [];
            }
            groupedMilestones[planType].push(milestone);
        });

        return groupedMilestones;
    };

    // Event handlers
    const handlePrintDiv = () => {
        // Implement print functionality
        console.log(`Printing quotation ${serviceInfo.quotation_id}`);
    };

    

    const createDuplicateQuote = async () => {
        console.log(`Creating duplicate quote for service ${serviceInfo.id}`);
        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/create-duplicate-quote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({service_price_id :serviceInfo.id }),
            });

            const result = await response.json();

            if (result.status) {
                toast.success("Quote duplicated successfully!");
                onClose();
                finalFunction();
            } else {
                toast.error(result.message || "Failed to duplicate.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while duplicating the quote.");
        }
    };

    const handleChangeServiceAmount = () => {
        setShowEditServiceAmount(true);
    };

    const handleSaveServiceAmount = () => {
        // Implement save service amount functionality
        console.log(`Saving service amount for service ${serviceInfo.id}: ${editServiceAmount}`);
        setShowEditServiceAmount(false);
    };

    const handleChangeExpiryDate = () => {
        setShowEditExpiryDate(true);
    };

    const handleSaveExpiryDate = async () => {
        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/update-service-link-expirydate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service_id: serviceInfo.id,
                    expiry_date: new Date(editExpiryDate).toLocaleDateString("en-US"), // Format as MM/DD/YYYY
                }),
            });

            const result = await response.json();
            console.log("Response:", result);

            if (result.status) {
                toast.success("Expiry date updated successfully!");
                after(serviceInfo.id);
                setShowEditExpiryDate(false);
            } else {
                toast.error("Failed to update expiry date.");
            }
        } catch (error) {
            console.error("Error updating expiry date:", error);
            toast.error("An error occurred. Please try again.");
        }
    };


    const [showMilestoneForm, setShowMilestoneForm] = useState(false);
    const [milestoneName, setMilestoneName] = useState("");
    const [milestonePrice, setMilestonePrice] = useState("0");
    const [planType, setPlanType] = useState("");
    const [errors, setErrors] = useState({});

    const handleAddMilestone = () => {
        setShowMilestoneForm(!showMilestoneForm); // Toggle visibility
    };

    const handleSaveMilestone = async () => {
        let validationErrors = {};

        if (!milestoneName.trim()) validationErrors.milestoneName = "Milestone name is required.";
        if (!milestonePrice) validationErrors.milestonePrice = "Milestone price is required.";
        if (!planType) validationErrors.planType = "Plan type is required.";

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Prepare data for API request
        const requestData = {
            ref_id: serviceInfo.ref_id,
            service_id: serviceInfo.id, // Assuming `serviceInfo.id` contains the `service_id`
            milestone_name: milestoneName,
            plan_type: planType || "", // If empty, send an empty string
        };

        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/add-extra-milestone", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Milestone added successfully!"); // Replace with a toast notification if needed
                // Reset form after saving
                setMilestoneName("");
                setMilestonePrice("0");
                setPlanType("");
                setErrors({});
                setShowMilestoneForm(false);
                after(serviceInfo.id);
            } else {
                toast.error(`Error: ${data.message || "Failed to add milestone"}`);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong. Please try again.");
        }

        // Reset form after saving
        setMilestoneName("");
        setMilestonePrice("0");
        setPlanType("");
        setErrors({});
        setShowMilestoneForm(false);
    };

    const handleChangeMilestoneAmount = (milestoneId) => {
        setMilestonesToEdit(prev => ({
            ...prev,
            [milestoneId]: {
                ...prev[milestoneId],
                showEdit: true
            }
        }));
    };

    const handleSaveMilestoneAmount = async (milestoneId, serviceId) => {
        // Implement save milestone amount functionality
        const amount = document.getElementById(`edit_milestone_amount${milestoneId}`).value;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        const requestData = {
            service_id: serviceId,
            milest_id: milestoneId,
            milestone_price: amount,
        };

        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/update-milestone-amount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Milestone amount updated successfully!"); // Replace with a toast notification if needed
                setMilestonesToEdit((prev) => ({
                    ...prev,
                    [milestoneId]: { ...prev[milestoneId], showEdit: false },
                }));
                after(serviceId);
            } else {
                toast.error(`Error: ${data.message || "Failed to update milestone amount"}`);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    const [milestoneStatus, setMilestoneStatus] = useState({});

    const ChangeMilestoneStatus = (milest_id, status) => {

        var statustochange = document.getElementById(`milestone_status${milest_id}`);
        if (statustochange) {
            statustochange.value = status;
        }
        // Update status in state
        setMilestoneStatus((prevStatus) => ({
            ...prevStatus,
            [milest_id]: status,
        }));

        // Show/hide the pending file div based on status
        const pendingFileDiv = document.getElementById(`pendingFileDiv${milest_id}`);
        if (pendingFileDiv) {
            pendingFileDiv.style.display = status == 1 ? "block" : "none";
        }
    };
    const handleDeleteMilestone = async (milestoneId, serviceId) => {
        console.log(`Deleting milestone ${milestoneId} from service ${serviceId}`);
        const isConfirmed = window.confirm("Are you sure you want to delete this milestone?");
        if (!isConfirmed) return;
        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/delete-milestone", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ milest_id: milestoneId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Milestone deleted successfully!");
                after(serviceId);
            } else {
                toast.error(`Error: ${data.message || "Failed to delete"}`);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    const handleChangeMilestoneStatus = (milestoneId, status) => {
        // Implement change milestone status functionality
        console.log(`Changing milestone ${milestoneId} status to ${status}`);
    };

    const handleDisableUrl = (serviceId) => {
        // Implement disable URL functionality
        console.log(`Disabling URL for service ${serviceId}`);
    };

    const handleSendReminderToClient = async (serviceId, refId) => {
        try {


            const response = await fetch("https://99crm.phdconsulting.in/api/send-reminder-to-client", {
                method: "POST",
                body: JSON.stringify({
                    service_price_id: serviceId,
                    ref_id: refId,
                }),
            });

            const data = await response.json();

            if (data.status) {
                toast.success("Reminder mail sent successfully")
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Something went wrong! " + error.message);
        }
    };


    const handlePriceQuoteAdminApproved = (serviceId, refId) => {
        // Implement admin approval functionality
        console.log(`Approving quote ${serviceId}, ref ${refId}`);
    };

    const priceQuoteCrmSendClient = async (quoteServiceId, refId) => {
        if (!window.confirm("Are you sure? You want to send for payment?")) return;

        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/price-quote-crm-send-client", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quote_service_id: quoteServiceId, ref_id: refId, user_id: sessionStorage.getItem("id"), user_name: sessionStorage.getItem("name") }),
            });

            const data = await response.json();

            if (data.status) {
                toast.error(data.message);
                after(serviceId);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Something went wrong! " + error.message);
        }
    };

    const handleEditAndAddServicePrice = (serviceId) => {
        // Implement edit and add service price functionality
        console.log(`Editing and saving service ${serviceId}`);
    };

    const submitPaidStatus = async (serviceId, milestoneId, event) => {
        event.preventDefault(); // Prevent default form submission

        const formElement = document.getElementById(`jvalidate${milestoneId}`);
        if (!formElement) {
            toast.error("Form not found");
            return;
        }

        const formData = new FormData(formElement);

        try {
            const response = await fetch("https://99crm.phdconsulting.in/api/change-milestone-status", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.status) {
                toast.success(data.message);
                // Update status in state
                setMilestoneStatus((prevStatus) => ({
                    ...prevStatus,
                    [milestoneId]: 0,
                }));
                after(serviceId); // Refresh details on success
            } else {
                toast.error(data.message || "Failed to update milestone status");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

   

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Parse JSON for discount, currency, etc.
    const discount_type = serviceInfo.discount_type ? JSON.parse(serviceInfo.discount_type) : {};
    const discount_value = serviceInfo.discount_value ? JSON.parse(serviceInfo.discount_value) : {};
    const currency_type = serviceInfo.currency_type ? JSON.parse(serviceInfo.currency_type) : {};
    const total_price = serviceInfo.total_price ? JSON.parse(serviceInfo.total_price) : {};
    const order_summary = serviceInfo.order_summary ? JSON.parse(serviceInfo.order_summary) : {};
    const coupon_code = serviceInfo.coupon_code ? JSON.parse(serviceInfo.coupon_code) : {};

    const groupedMilestones = groupMilestonesByPlanType();
    const SITEURL = 'https://99crm.phdconsulting.in/';

    return (
        <div className='bg-gray-100 p-2 rounded my-3'>
            <button onClick={() => handlePrintDiv(serviceInfo.quotation_id)}>
                <i className="fa fa-download"></i>
            </button>
            <div style={{ marginRight: '25px' }} className="pull-right" id={`loadDuplicateBtnDiv${serviceInfo.id}`}>
                {sessionStorage.getItem("user_type") == 'user' && (
                    <button onClick={() => createDuplicateQuote(serviceInfo.id)} className="btn btn-info btn-sm">
                        Create Duplicate Quote
                    </button>
                )}
            </div>
            <table id={`pdf${serviceInfo.quotation_id}`} width="100%" cellPadding="0" cellSpacing="0" style={{ padding: '10px 15px' }}>
                <tbody>
                    <tr>
                        <td colSpan="2" style={{ padding: '3px 5px', fontSize: '14px', textAlign: 'left' }}><b>Quotation ID</b></td>
                        <td colSpan="2" style={{ padding: '3px 10px', fontSize: '14px', textAlign: 'left' }}>{serviceInfo.quotation_id}</td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="15" style={{ fontSize: '12px', lineHeight: '15px' }}>&nbsp;</td>
                    </tr>

                    {serviceInfo.quote_heading && (
                        <tr>
                            <td colSpan="2" style={{ padding: '3px 5px', fontSize: '14px', textAlign: 'left' }}><b>Quote Heading</b></td>
                            <td colSpan="2" style={{ padding: '3px 10px', fontSize: '14px', textAlign: 'left' }}>{serviceInfo.quote_heading}</td>
                        </tr>
                    )}

                    <tr>
                        <td colSpan="2" style={{ padding: '3px 5px', fontSize: '14px', textAlign: 'left' }}><b>Service Name</b></td>
                        <td colSpan="2" style={{ padding: '3px 10px', fontSize: '14px', textAlign: 'left' }}>{serviceInfo.quote_service_name}</td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="15" style={{ fontSize: '12px', lineHeight: '15px' }}>&nbsp;</td>
                    </tr>

                    <tr>
                        <td colSpan="2" style={{ padding: '5px 5px' }}><b>Discount Value</b></td>
                        <td colSpan="2" style={{ padding: '5px 15px' }}>
                            {Array.isArray(Object.keys(discount_type)) && Array.isArray(Object.keys(discount_value)) ? (
                                Object.keys(discount_value).map(key => {
                                    const is_recommended = (recommendedPlan == key.charAt(0).toUpperCase() + key.slice(1))
                                        ? ' Recommended'
                                        : '';
                                    return (
                                        <div key={key}>
                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {discount_value[key]}
                                            {discount_type[key] == 1 ? "%" : (discount_type[key] != 2 ? "None" : "")}
                                            <span style={{ color: 'green' }}>{is_recommended}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <>{serviceInfo.discount_value}{serviceInfo.discount_type == 1 ? "%" : ""}</>
                            )}
                        </td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Total Amount */}
                    <tr>
                        <td colSpan="2" style={{ padding: '5px 5px' }}><b>Total Amount</b></td>
                        <td colSpan="2" style={{ padding: '5px 15px' }}>
                            <span id={`show_sr_amount_div${serviceInfo.id}`} style={{ display: showEditServiceAmount ? 'none' : 'block' }}>
                                {Array.isArray(Object.keys(currency_type)) && Array.isArray(Object.keys(total_price)) ? (
                                    Object.keys(currency_type).map(key => {
                                        const is_recommended = (recommendedPlan == key.charAt(0).toUpperCase() + key.slice(1))
                                            ? ' Recommended'
                                            : '';
                                        return (
                                            <div key={key}>
                                                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {currency_type[key]} {total_price[key]}
                                                <span style={{ color: 'green' }}>{is_recommended}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <>{serviceInfo.currency_type} {serviceInfo.total_price}</>
                                )}
                                {sessionStorage.getItem("user_type") == 'user' && serviceInfo.status == 1 && (
                                    <span onClick={() => handleChangeServiceAmount()} style={{ fontSize: '15px', marginLeft: '10px', cursor: 'pointer' }} className="fa fa-edit"></span>
                                )}
                            </span>

                            <span id={`edit_sr_amount_div${serviceInfo.id}`} style={{ display: showEditServiceAmount ? 'block' : 'none' }}>
                                <input
                                    className="form-control1"
                                    style={{ width: '100px' }}
                                    type="text"
                                    name={`edit_service_amount${serviceInfo.id}`}
                                    id={`edit_service_amount${serviceInfo.id}`}
                                    value={editServiceAmount}
                                    onChange={(e) => setEditServiceAmount(e.target.value)}
                                />
                                <input
                                    className="btn btn-info btn-xs"
                                    type="button"
                                    onClick={() => handleSaveServiceAmount()}
                                    value="Save"
                                />
                            </span>
                        </td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Coupon Code */}
                    <tr>
                        <td colSpan="2" style={{ padding: '5px 5px' }}><b>Coupon Code</b></td>
                        <td colSpan="2" style={{ padding: '5px 15px' }}>
                            {Array.isArray(Object.keys(coupon_code)) ? (
                                Object.keys(coupon_code).map(key => {
                                    const is_recommended = (recommendedPlan == key.charAt(0).toUpperCase() + key.slice(1))
                                        ? ' Recommended'
                                        : '';
                                    return (
                                        <div key={key}>
                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {coupon_code[key] == "" ? "No Coupon Applied" : coupon_code[key]}
                                            <span style={{ color: 'green' }}>{is_recommended}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <>{serviceInfo.coupon_code || "No Coupon Applied"}</>
                            )}
                        </td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Additional Remarks */}
                    <tr>
                        <td colSpan="2" style={{ padding: '5px 5px' }}><b>Additional Remarks</b></td>
                        <td colSpan="2" style={{ padding: '5px 15px' }}>
                            {typeof order_summary == 'object' && order_summary != null ? (
                                Object.keys(order_summary).map(key => (
                                    <div key={key}>
                                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {order_summary[key]}
                                    </div>
                                ))
                            ) : (
                                <>{serviceInfo.order_summary}</>
                            )}
                        </td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Template File */}
                    {serviceInfo.file_permission == 'Yes' && uploadFileArr.file_title_name && uploadFileArr.upload_file && (
                        <>
                            <tr>
                                <td colSpan="2" style={{ padding: '5px 5px' }}><b>Template File</b></td>
                                <td colSpan="2" style={{ padding: '5px 15px' }}>
                                    <a href={`${SITEURL}public/UploadFolder/${uploadFileArr.upload_file}`} download className="label label-default bg-gray-400 rounded px-1 py-0.5 bg-gray-400 rounded px-1 py-0.5">
                                        {uploadFileArr.file_title_name} <i className="fa fa-download text-light" aria-hidden="true"></i>
                                    </a>
                                </td>
                            </tr>
                            <tr className="hide">
                                <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                            </tr>
                        </>
                    )}

                    {/* CRM Uploaded File */}
                    {Array.isArray(extraFile) && extraFile.length > 0 && (
                        <>
                            <tr>
                                <td colSpan="2" style={{ padding: '5px 5px' }}><b>CRM Uploaded File</b></td>
                                <td colSpan="2" style={{ padding: '5px 15px' }}>
                                    {extraFile.map((file, index) => (
                                        <a key={index} href={`${SITEURL}public/UploadFolder/${file.file_path}`} download className="label label-default bg-gray-400 rounded px-1 py-0.5">
                                            {file.filename} <i className="fa fa-download text-light" aria-hidden="true"></i>
                                        </a>
                                    ))}
                                </td>
                            </tr>
                            <tr className="hide">
                                <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                            </tr>
                        </>
                    )}

                    {/* Payment URL */}
                    {serviceInfo.payment_website != "Other" && serviceInfo.status > 2 && (
                        <>
                            <tr>
                                <td colSpan="2" style={{ padding: '5px 5px' }}><b>Payment Url</b></td>
                                <td colSpan="2" style={{ padding: '5px 15px' }}>
                                    {serviceInfo.disableUrl == 'Yes' ? (
                                        <strike>{`${SITEURL}checkout?id=${btoa(serviceInfo.id)}`}</strike>
                                    ) : (
                                        <a href={`${SITEURL}checkout?id=${btoa(serviceInfo.id)}`} target="_blank" rel="noopener noreferrer">
                                            {`${SITEURL}checkout?id=${btoa(serviceInfo.id)}`}
                                        </a>
                                    )}

                                    {/* Delete URL button logic */}
                                    {(() => {
                                        let checkMilestonePaid = 'No';
                                        serviceMilestoneData.forEach(milestone => {
                                            if (milestone.status == 1 && checkMilestonePaid == 'No') {
                                                checkMilestonePaid = 'Yes';
                                            }
                                        });

                                        if (checkMilestonePaid == 'No' &&
                                            serviceMilestoneData.length > 0 &&
                                            serviceInfo.status == 4 &&
                                            serviceInfo.disableUrl != 'Yes') {
                                            return (
                                                <a
                                                    className="label label-danger delete_url"
                                                    id="delete_url_btn"
                                                    onClick={() => handleDisableUrl(serviceInfo.id)}
                                                >
                                                    Delete URL
                                                </a>
                                            );
                                        }
                                        return null;
                                    })()}
                                </td>
                            </tr>
                            <tr className="hide">
                                <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                            </tr>
                        </>
                    )}

                    {/* Expiry Date */}
                    {serviceInfo.expiry_date && (
                        <>
                            <tr>
                                <td colSpan="2" style={{ padding: '5px 5px' }}><b>Expiry Date</b></td>
                                <td colSpan="2" style={{ padding: '5px 15px' }}>
                                    <span id={`show_expdate_div${serviceInfo.id}`} style={{ display: showEditExpiryDate ? 'none' : 'block' }}>
                                        {formatDate(serviceInfo.expiry_date)}
                                        {sessionStorage.getItem("user_type") == 'user' && (
                                            <span
                                                onClick={() => handleChangeExpiryDate()}
                                                style={{ fontSize: '15px', marginLeft: '10px', cursor: 'pointer' }}
                                                className="fa fa-edit"
                                            ></span>
                                        )}
                                    </span>

                                    <span id={`edit_expdate_div${serviceInfo.id}`} style={{ display: showEditExpiryDate ? 'block' : 'none' }}>
                                        <input
                                            type="date"
                                            className="form-control datepicker edit_expiry_date"
                                            name={`edit_expiry_date${serviceInfo.id}`}
                                            id={`edit_expiry_date${serviceInfo.id}`}
                                            value={editExpiryDate}
                                            onChange={(e) => setEditExpiryDate(e.target.value)}
                                        />
                                        <input
                                            className="btn btn-info btn-xs pull-right"
                                            type="button"
                                            onClick={() => handleSaveExpiryDate()}
                                            value="Save"
                                        />
                                    </span>
                                </td>
                            </tr>
                            <tr className="hide">
                                <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                            </tr>
                        </>
                    )}

                    {/* Online Payment */}
                    <tr>
                        <td colSpan="2" style={{ padding: '5px 5px' }}><b>Online Payment</b></td>
                        <td colSpan="2" style={{ padding: '5px 15px' }}>
                            {serviceInfo.notSendOnlinePayment == 1 ? "No" : "Yes"}
                        </td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Payment Details */}
                    {serviceInfo.notSendOnlinePayment == 1 && (
                        <>
                            <tr>
                                <td colSpan="2" style={{ padding: '5px 15px' }}><b>Payment Details</b></td>
                                <td colSpan="2" style={{ padding: '5px 15px' }}>
                                    {serviceInfo.payment_details}
                                </td>
                            </tr>
                            <tr className="hide">
                                <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                            </tr>
                        </>
                    )}

                    {/* Milestone Details Header */}
                    <tr>
                        <td colSpan="2" style={{ padding: '5px 15px' }}><b>Milestone Details</b></td>
                        {sessionStorage.getItem("user_type") == 'user' && (
                            <td colSpan="2" style={{ padding: '5px 15px' }}>
                                <span className="btn btn-primary btn-sm" onClick={() => handleAddMilestone(serviceInfo.id)}>
                                    {showMilestoneForm ? "Hide Milestone Form" : "Add Milestone"}
                                </span>
                            </td>
                        )}
                        {sessionStorage.getItem("user_type") == 'user' && serviceInfo.status == 4 && (
                            <td colSpan="2" id={`sendRemindBtn${serviceInfo.id}`}>
                                <div className="btn btn-primary btn-sm" onClick={() => handleSendReminderToClient(serviceInfo.id, serviceInfo.ref_id)}>
                                    Send Reminder to client
                                </div>
                            </td>
                        )}
                    </tr>
                    {showMilestoneForm && (
                        <>
                            <tr>
                                <td colSpan={4} className="p-2">
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        name="milestone_name"
                                        id={`milestone_name${serviceInfo.id}`}
                                        value={milestoneName}
                                        onChange={(e) => setMilestoneName(e.target.value)}
                                        placeholder="Milestone Name"
                                    />
                                    {errors.milestoneName && (
                                        <span className="text-sm text-red-500">{errors.milestoneName}</span>
                                    )}
                                </td>

                                <td className="p-2" colSpan={1}>
                                    <input
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        name="milestone_price"
                                        id={`milestone_price${serviceInfo.id}`}
                                        value={milestonePrice}
                                        onChange={(e) => setMilestonePrice(e.target.value)}
                                        placeholder="Milestone Price"
                                        disabled
                                    />
                                    {errors.milestonePrice && (
                                        <span className="text-sm text-red-500">{errors.milestonePrice}</span>
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="p-2" colSpan={4}>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        name="plan_type"
                                        id={`plan_type${serviceInfo.id}`}
                                        value={planType}
                                        onChange={(e) => setPlanType(e.target.value)}
                                    >
                                        <option value="">Select Plan Type</option>
                                        <option value="basic">Basic</option>
                                        <option value="standard">Standard</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                    {errors.planType && (
                                        <span className="text-sm text-red-500">{errors.planType}</span>
                                    )}
                                </td>

                                <td className="p-2">
                                    <button
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 text-sm"
                                        onClick={handleSaveMilestone}
                                    >
                                        Save
                                    </button>
                                </td>
                            </tr>
                        </>
                    )}

                    <tr className="hide">
                        <td colSpan="6" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Milestone Table */}
                    <tr>
                        <td colSpan="6" style={{ padding: '5px 15px' }}>
                            <table width="100%" border="0" cellSpacing="1" cellPadding="1">
                                <thead>
                                    <tr>
                                        <th style={{ padding: '8px', background: '#eee', border: '1px solid #eee' }}>#</th>
                                        <th style={{ padding: '8px', background: '#eee', border: '1px solid #eee' }}>Plan Type</th>
                                        <th style={{ padding: '8px', background: '#eee', border: '1px solid #eee' }}>Milestone Name</th>
                                        <th style={{ padding: '8px', background: '#eee', border: '1px solid #eee' }}>Milestone Price</th>
                                        <th style={{ padding: '8px', background: '#eee', border: '1px solid #eee' }}>Discounted Price</th>
                                        {sessionStorage.getItem("user_type") == 'user' && (
                                            <th style={{ padding: '8px', background: '#eee', border: '1px solid #eee' }}>Action</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(groupedMilestones).map((planType) => (
                                        <>
                                            <React.Fragment key={planType} >
                                                <tr>
                                                    <td colSpan="6" style={{ background: "#CBE7FFFF", fontWeight: "bold", padding: "10px" }}>
                                                        {planType.charAt(0).toUpperCase() + planType.slice(1)}
                                                    </td>
                                                </tr>

                                                {groupedMilestones[planType].map((milestone, index) => {
                                                    let subMilestoneData = "";
                                                    try {
                                                        subMilestoneData = milestone.subMilestoneData ? JSON.parse(milestone.subMilestoneData) : "";
                                                    } catch (error) {
                                                        console.error("Invalid JSON in subMilestoneData", error);
                                                    }

                                                    const rowClass = (index + 1) % 2 == 0 ? "evenClass" : "oddClass";

                                                    // Calculate discounted price
                                                    let discountedPrice;
                                                    const milestoneDiscountType = discount_type?.[planType] ?? serviceInfo.discount_type;
                                                    const milestoneDiscountValue = discount_value?.[planType] ?? serviceInfo.discount_value;

                                                    if (milestoneDiscountType == 1) {
                                                        // Percentage discount
                                                        discountedPrice = (milestone.milestone_price - (milestone.milestone_price * milestoneDiscountValue) / 100).toFixed(2);
                                                    } else if (milestoneDiscountType == 2) {
                                                        // Fixed amount discount
                                                        const count = groupedMilestones[planType].length;
                                                        discountedPrice = (milestone.milestone_price - milestoneDiscountValue / Math.max(count, 1)).toFixed(2);
                                                    } else {
                                                        // No discount
                                                        discountedPrice = parseFloat(milestone.milestone_price).toFixed(2);
                                                    }

                                                    return (
                                                        <React.Fragment key={milestone.id} >
                                                            {/* Main milestone row */}
                                                            <tr className={rowClass} >
                                                                <td style={{ padding: "8px", border: "1px solid #eee" }}>
                                                                    <strong>{index + 1}.</strong>
                                                                </td>
                                                                <td style={{ padding: "8px", border: "1px solid #eee" }}>
                                                                    {milestone.plan_type ? milestone.plan_type.charAt(0).toUpperCase() + milestone.plan_type.slice(1) : serviceInfo.select_plan}
                                                                </td>
                                                                <td style={{ padding: "8px", border: "1px solid #eee" }}>{milestone.milestone_name}</td>
                                                                <td style={{ padding: "8px", border: "1px solid #eee" }}>
                                                                    <span id={`show_ml_amount_div${milestone.id}`} style={{ display: milestonesToEdit[milestone.id]?.showEdit ? "none" : "block" }}>
                                                                        {milestone.milestone_price}
                                                                        {sessionStorage.getItem("user_type") == "user" && milestone.status != 1 && (
                                                                            <span
                                                                                onClick={() => handleChangeMilestoneAmount(milestone.id)}
                                                                                style={{ fontSize: "15px", marginLeft: "5px", cursor: "pointer" }}
                                                                                className="fa fa-edit"
                                                                            ></span>
                                                                        )}
                                                                    </span>

                                                                    <span id={`edit_ml_amount_div${milestone.id}`} style={{ display: milestonesToEdit[milestone.id]?.showEdit ? "block" : "none" }}>
                                                                        <input
                                                                            className="form-control1"
                                                                            style={{ width: "100px" }}
                                                                            type="text"
                                                                            name={`edit_milestone_amount${milestone.id}`}
                                                                            id={`edit_milestone_amount${milestone.id}`}
                                                                            value={milestonesToEdit[milestone.id]?.amount || milestone.milestone_price}
                                                                            onChange={(e) =>
                                                                                setMilestonesToEdit((prev) => ({
                                                                                    ...prev,
                                                                                    [milestone.id]: { ...prev[milestone.id], amount: e.target.value },
                                                                                }))
                                                                            }
                                                                        />
                                                                        <input
                                                                            className="btn btn-info btn-xs"
                                                                            type="button"
                                                                            onClick={() => handleSaveMilestoneAmount(milestone.id, milestone.service_id)}
                                                                            value="Save"
                                                                        />
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: "8px", border: "1px solid #eee" }}>{discountedPrice}</td>
                                                                {sessionStorage.getItem("user_type") == "user" && (
                                                                    <td style={{ padding: "8px", border: "1px solid #eee" }}>
                                                                        {(milestone.status == 0 || milestone.status == 4) && (
                                                                            <button className='hover:bg-red-200 rounded-full p-1' type="button" onClick={() => handleDeleteMilestone(milestone.id, milestone.service_id)}>
                                                                                <Trash2 size={18} className='text-red-500' />
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                )}
                                                            </tr>

                                                            {/* Upload file row */}
                                                            {milestone.status > 0 && (
                                                                <tr className={rowClass}>
                                                                    <td colSpan="2" style={{ padding: "5px" }}>
                                                                        {milestone.uplaoded_file && (
                                                                            <>
                                                                                Upload File :{" "}
                                                                                <a download href={`${SITEURL}public/UploadFolder/${milestone.uplaoded_file}`}>
                                                                                    <i className="fa fa-download"></i> Download
                                                                                </a>
                                                                            </>
                                                                        )}
                                                                    </td>
                                                                    <td colSpan="2" style={{ padding: "5px" }}>
                                                                        {milestone.subscription_code && <>Subscription Code : <strong>{milestone.subscription_code}</strong></>}
                                                                    </td>
                                                                </tr>
                                                            )}

                                                            {/* Remarks row */}
                                                            {milestone.milestone_remark && (
                                                                <tr className={rowClass}>
                                                                    <td colSpan="3" style={{ padding: "5px" }}>
                                                                        Remarks : {milestone.milestone_remark}
                                                                    </td>
                                                                    <td colSpan="2" style={{ padding: "5px" }}></td>
                                                                </tr>
                                                            )}
                                                            <tr>
                                                                <td colSpan="2" style={{ padding: "5px" }}>
                                                                    Status:{" "} {console.log("milestone status is", milestone.status)}
                                                                    {sessionStorage.getItem("user_type") == "user" && milestone.status == 0 ? (
                                                                        <select
                                                                            style={{ width: "90px" }}
                                                                            onChange={(e) => ChangeMilestoneStatus(milestone.id, e.target.value)}
                                                                            disabled={milestone.status == 1 || serviceInfo.status < 4}
                                                                        >
                                                                            <option value="1" selected={milestone.status == 1}>Paid</option>
                                                                            <option value="0" selected={milestone.status == 0}>Pending</option>
                                                                        </select>
                                                                    ) : (
                                                                        <span
                                                                            className={
                                                                                milestone.status == 1
                                                                                    ? "label label-warning bg-yellow-600 text-white rounded px-1 py-0.5"
                                                                                    : milestone.status == 2
                                                                                        ? "label label-success text-white bg-green-600 rounded px-1 py-0.5"
                                                                                        : "label label-warning bg-yellow-600 text-white rounded px-1 py-0.5"
                                                                            }
                                                                        >
                                                                            {milestone.status == 1
                                                                                ? "Paid"
                                                                                : milestone.status == 2
                                                                                    ? "Confirmed"
                                                                                    : "Pending"}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            {milestone.status == 2 && (
                                                                <>
                                                                    <tr className={rowClass}>
                                                                        <td colSpan="3" style={{ padding: "5px" }}>
                                                                            {milestone.comments && <>Confirmed Comments : {milestone.comments}</>}
                                                                        </td>
                                                                        <td colSpan="2" style={{ padding: "5px", fontWeight: "bold" }}>
                                                                            Confirmation Id : {milestone.confirmation_id}
                                                                        </td>
                                                                    </tr>
                                                                    <tr className="hide">
                                                                        <td colSpan="5" height="25" style={{ fontSize: "25px", lineHeight: "25px" }}>
                                                                            &nbsp;
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                            <tr id={`pendingFileDiv${milestone.id}`} className={rowClass} style={{ display: "none" }}>
                                                                <td colSpan="4">
                                                                    <form method="post" id={`jvalidate${milestone.id}`} name={`jvalidate${milestone.id}`}>
                                                                        <div className="flex flex-col gap-4 p-4">
                                                                            <div className="flex items-center gap-4">
                                                                                <label className="font-medium">Upload File</label>
                                                                                <input
                                                                                    type="file"
                                                                                    name="milestone_file"
                                                                                    id={`milestone_file${milestone.id}`}
                                                                                    className="border border-gray-300 rounded-md p-2 w-full"
                                                                                />
                                                                            </div>
                                                                            <div className="flex items-center gap-4">
                                                                                <label className="font-medium">Subscription amount included</label>
                                                                                <input type="checkbox" name="paid_subscription_amount" className="w-5 h-5" />
                                                                            </div>
                                                                            <input type="hidden" name="milest_id" value={milestone.id} />
                                                                            <input type="hidden" name="service_id" value={milestone.service_id} />
                                                                            <input type="hidden" name="milestone_status" id={`milestone_status${milestone.id}`} />
                                                                            <div className="flex justify-end">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(event) => submitPaidStatus(milestone.service_id, milestone.id, event)}
                                                                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                                                                                >
                                                                                    Submit
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </form>
                                                                </td>
                                                            </tr>




                                                            {subMilestoneData && subMilestoneData.parameters && subMilestoneData.parameters.length > 0 && (
                                                                <React.Fragment key={index}>
                                                                    <tr>
                                                                        <td colSpan="5">
                                                                            <table width="100%" className="table">
                                                                                <thead>
                                                                                    <tr style={{ backgroundColor: "#eee" }}>
                                                                                        <th style={{ padding: "8px", border: "1px solid #eee" }}>Parameters</th>
                                                                                        <th style={{ padding: "8px", border: "1px solid #eee" }}>No. of words</th>
                                                                                        <th style={{ padding: "8px", border: "1px solid #eee" }}>Time Frame</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {subMilestoneData.parameters.map((param, j) => (
                                                                                        <tr key={j}>
                                                                                            <td style={{ padding: "8px", border: "1px solid #eee" }}>{param}</td>
                                                                                            <td style={{ padding: "8px", border: "1px solid #eee" }}>
                                                                                                {subMilestoneData.no_of_words[j]}
                                                                                            </td>
                                                                                            <td style={{ padding: "8px", border: "1px solid #eee" }}>
                                                                                                {subMilestoneData.time_frame[j]}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                </React.Fragment>
                                                            )}


                                                        </React.Fragment>
                                                    );
                                                })}

                                            </React.Fragment>

                                        </>
                                    ))}
                                    {(serviceInfo.status == 2 && (sessionStorage.getItem("user_type") == "admin" || sessionStorage.getItem("user_type") == "sub-admin")) && (
                                        <tr>
                                            <td colSpan="3">
                                                {sessionStorage.getItem("accessQuoteApproval") == "Yes" ? (
                                                    <button
                                                        className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md"
                                                    onClick={() => EditAndAddServicePrice(serviceInfo.id, serviceInfo.ref_id)}
                                                    >
                                                        Edit & Approve
                                                    </button>
                                                ) : sessionStorage.getItem("user_type") == "user" ? (
                                                    <button
                                                        className="bg-gray-300 border border-gray-400 hover:bg-gray-300 text-black px-4 py-2 rounded-md"
                                                    //onClick={() => EditAndAddServicePrice(serviceInfo.id)}
                                                    >
                                                        Edit & Save
                                                    </button>
                                                ) : null}
                                            </td>
                                            <td align="right" colSpan="3" id={`adminApproveQuote${serviceInfo.id}`}>
                                                {sessionStorage.getItem("accessQuoteApproval") == "Yes" && (
                                                    <button
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                                                    //onClick={() => priceQuoteAdminApproved(serviceInfo.id, serviceInfo.ref_id)}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                    {serviceInfo.status == 1 && sessionStorage.getItem("user_type") == "user" && (
                                        <tr>
                                            <td colSpan="3">
                                                <button
                                                    className="bg-gray-300 border border-gray-400 hover:bg-gray-300 text-black px-4 py-2 rounded-md"
                                                onClick={() => EditAndAddServicePrice(serviceInfo.id, serviceInfo.ref_id)}
                                                >
                                                    Edit & Save
                                                </button>
                                            </td>
                                            <td align="right" colSpan="3" id={`adminApproveQuote${serviceInfo.id}`}>
                                                {sessionStorage.getItem("accessQuoteApproval") != "Yes" && (
                                                    <button
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                                                    //onClick={() => priceQuoteAdminApproved(serviceInfo.id, serviceInfo.ref_id)}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                    {serviceInfo.status == 2 && sessionStorage.getItem("user_type") == "user" && (
                                        <tr>
                                            <td colSpan="3">
                                                <button
                                                    className="bg-gray-300 border border-gray-400 hover:bg-gray-300 text-black px-4 py-2 rounded-md"
                                                onClick={() => EditAndAddServicePrice(serviceInfo.id, serviceInfo.ref_id)}
                                                >
                                                    Edit & Save
                                                </button>
                                            </td>
                                            <td align="right" colSpan="3" id={`adminApproveQuote${serviceInfo.id}`}>
                                                {sessionStorage.getItem("accessQuoteApproval") != "Yes" && (
                                                    <button
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                                                    //onClick={() => priceQuoteAdminApproved(serviceInfo.id, serviceInfo.ref_id)}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                    {serviceInfo.status == 3 && (sessionStorage.getItem("user_type") == "user" || sessionStorage.getItem("user_type") == "sub-admin") && (
                                        <tr>
                                            <td align="right" colSpan="6" id={`crmSendClientQuote${serviceInfo.id}`}>
                                                <button
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                                                    onClick={() => priceQuoteCrmSendClient(serviceInfo.id, serviceInfo.ref_id)}
                                                >
                                                    Send to Client
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </td>
                    </tr >
                </tbody >
            </table >
        </div >
    );
}

export default ServiceDetails;

