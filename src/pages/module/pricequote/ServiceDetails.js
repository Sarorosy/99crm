import React, { useState } from 'react';

const ServiceDetails = ({ serviceId, onClose, serviceInfo, serviceMilestoneData }) => {
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

    const createDuplicateQuote = () => {
        // Implement duplicate quote functionality
        console.log(`Creating duplicate quote for service ${serviceInfo.id}`);
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

    const handleSaveExpiryDate = () => {
        // Implement save expiry date functionality
        console.log(`Saving expiry date for service ${serviceInfo.id}: ${editExpiryDate}`);
        setShowEditExpiryDate(false);
    };

    const handleAddMilestone = () => {
        // Implement add milestone functionality
        console.log(`Adding milestone for service ${serviceInfo.id}`);
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

    const handleSaveMilestoneAmount = (milestoneId, serviceId) => {
        // Implement save milestone amount functionality
        console.log(`Saving milestone amount for milestone ${milestoneId}, service ${serviceId}`);
        setMilestonesToEdit(prev => ({
            ...prev,
            [milestoneId]: {
                ...prev[milestoneId],
                showEdit: false
            }
        }));
    };

    const handleDeleteMilestone = (milestoneId, serviceId) => {
        // Implement delete milestone functionality
        console.log(`Deleting milestone ${milestoneId} from service ${serviceId}`);
    };

    const handleChangeMilestoneStatus = (milestoneId, status) => {
        // Implement change milestone status functionality
        console.log(`Changing milestone ${milestoneId} status to ${status}`);
    };

    const handleDisableUrl = (serviceId) => {
        // Implement disable URL functionality
        console.log(`Disabling URL for service ${serviceId}`);
    };

    const handleSendReminderToClient = (serviceId) => {
        // Implement send reminder functionality
        console.log(`Sending reminder to client for service ${serviceId}`);
    };

    const handlePriceQuoteAdminApproved = (serviceId, refId) => {
        // Implement admin approval functionality
        console.log(`Approving quote ${serviceId}, ref ${refId}`);
    };

    const handlePriceQuoteCrmSendClient = (serviceId, refId) => {
        // Implement send to client functionality
        console.log(`Sending quote ${serviceId}, ref ${refId} to client`);
    };

    const handleEditAndAddServicePrice = (serviceId) => {
        // Implement edit and add service price functionality
        console.log(`Editing and saving service ${serviceId}`);
    };

    const submitPaidStatus = (serviceId, milestoneId) => {
        // Implement submit paid status functionality
        console.log(`Submitting paid status for milestone ${milestoneId}, service ${serviceId}`);
        return false; // Prevent form submission
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

    const userInfo = { user_type: 'user' }; // This would come from props or context in a real app
    const groupedMilestones = groupMilestonesByPlanType();
    const SITEURL = process.env.REACT_APP_SITE_URL || 'https://example.com/';

    return (
        <div className='bg-gray-100 p-2 rounded my-3'>
            <button onClick={() => handlePrintDiv(serviceInfo.quotation_id)}>
                <i className="fa fa-download"></i>
            </button>
            <div style={{ marginRight: '25px' }} className="pull-right" id={`loadDuplicateBtnDiv${serviceInfo.id}`}>
                {userInfo.user_type === 'user' && (
                    <button onClick={() => createDuplicateQuote(serviceInfo.id)} className="btn btn-info btn-sm">
                        Create Duplicate Quote
                    </button>
                )}
            </div>
            <table id={`pdf${serviceInfo.quotation_id}`} width="100%" cellPadding="0" cellSpacing="0" style={{ padding: '10px 15px' }}>
                <tbody>
                    {/* Quotation ID */}
                    <tr>
                        <td colSpan="2" style={{ padding: '5px 5px' }}><b>Quotation ID</b></td>
                        <td colSpan="2" style={{ padding: '5px 15px' }}>{serviceInfo.quotation_id}</td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Quote Heading */}
                    {serviceInfo.quote_heading && (
                        <>
                            <tr>
                                <td colSpan="2" style={{ padding: '5px 5px' }}><b>Quote Heading</b></td>
                                <td colSpan="2" style={{ padding: '5px 15px' }}>{serviceInfo.quote_heading}</td>
                            </tr>
                        </>
                    )}

                    {/* Service Name */}
                    <tr>
                        <td colSpan="2" style={{ padding: '5px 5px' }}><b>Service Name</b></td>
                        <td colSpan="2" style={{ padding: '5px 15px' }}>{serviceInfo.quote_service_name}</td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Discount Value */}
                    <tr>
                        <td colSpan="2" style={{ padding: '5px 5px' }}><b>Discount Value</b></td>
                        <td colSpan="2" style={{ padding: '5px 15px' }}>
                            {Array.isArray(Object.keys(discount_type)) && Array.isArray(Object.keys(discount_value)) ? (
                                Object.keys(discount_value).map(key => {
                                    const is_recommended = (recommendedPlan === key.charAt(0).toUpperCase() + key.slice(1))
                                        ? ' Recommended'
                                        : '';
                                    return (
                                        <div key={key}>
                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {discount_value[key]}
                                            {discount_type[key] === 1 ? "%" : (discount_type[key] !== 2 ? "None" : "")}
                                            <span style={{ color: 'green' }}>{is_recommended}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <>{serviceInfo.discount_value}{serviceInfo.discount_type === 1 ? "%" : ""}</>
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
                                        const is_recommended = (recommendedPlan === key.charAt(0).toUpperCase() + key.slice(1))
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
                                {userInfo.user_type === 'user' && serviceInfo.status === 1 && (
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
                                    const is_recommended = (recommendedPlan === key.charAt(0).toUpperCase() + key.slice(1))
                                        ? ' Recommended'
                                        : '';
                                    return (
                                        <div key={key}>
                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {coupon_code[key] === "" ? "No Coupon Applied" : coupon_code[key]}
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
                            {typeof order_summary === 'object' && order_summary !== null ? (
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
                    {serviceInfo.file_permission === 'Yes' && uploadFileArr.file_title_name && uploadFileArr.upload_file && (
                        <>
                            <tr>
                                <td colSpan="2" style={{ padding: '5px 5px' }}><b>Template File</b></td>
                                <td colSpan="2" style={{ padding: '5px 15px' }}>
                                    <a href={`${SITEURL}public/UploadFolder/${uploadFileArr.upload_file}`} download className="label label-default">
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
                                        <a key={index} href={`${SITEURL}public/UploadFolder/${file.file_path}`} download className="label label-default">
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
                    {serviceInfo.payment_website !== "Other" && serviceInfo.status > 2 && (
                        <>
                            <tr>
                                <td colSpan="2" style={{ padding: '5px 5px' }}><b>Payment Url</b></td>
                                <td colSpan="2" style={{ padding: '5px 15px' }}>
                                    {serviceInfo.disableUrl === 'Yes' ? (
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
                                            if (milestone.status === 1 && checkMilestonePaid === 'No') {
                                                checkMilestonePaid = 'Yes';
                                            }
                                        });

                                        if (checkMilestonePaid === 'No' &&
                                            serviceMilestoneData.length > 0 &&
                                            serviceInfo.status === 4 &&
                                            serviceInfo.disableUrl !== 'Yes') {
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
                                        {userInfo.user_type === 'user' && (
                                            <span
                                                onClick={() => handleChangeExpiryDate()}
                                                style={{ fontSize: '15px', marginLeft: '10px', cursor: 'pointer' }}
                                                className="fa fa-edit"
                                            ></span>
                                        )}
                                    </span>

                                    <span id={`edit_expdate_div${serviceInfo.id}`} style={{ display: showEditExpiryDate ? 'block' : 'none' }}>
                                        <input
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
                            {serviceInfo.notSendOnlinePayment === 1 ? "No" : "Yes"}
                        </td>
                    </tr>
                    <tr className="hide">
                        <td colSpan="4" height="25" style={{ fontSize: '25px', lineHeight: '25px' }}>&nbsp;</td>
                    </tr>

                    {/* Payment Details */}
                    {serviceInfo.notSendOnlinePayment === 1 && (
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
                        {userInfo.user_type === 'user' && (
                            <td colSpan="2" style={{ padding: '5px 15px' }}>
                                <span className="btn btn-primary btn-sm" onClick={() => handleAddMilestone(serviceInfo.id)}>
                                    Add Extra Milestone
                                </span>
                            </td>
                        )}
                        {userInfo.user_type === 'user' && serviceInfo.status === 4 && (
                            <td colSpan="2" id={`sendRemindBtn${serviceInfo.id}`}>
                                <div className="btn btn-primary btn-sm" onClick={() => handleSendReminderToClient(serviceInfo.id)}>
                                    Send Reminder to client
                                </div>
                            </td>
                        )}
                    </tr>
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
                                        {userInfo.user_type === 'user' && (
                                            <th style={{ padding: '8px', background: '#eee', border: '1px solid #eee' }}>Action</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(groupedMilestones).map((planType) => (
                                        <React.Fragment key={planType}>
                                            <tr>
                                                <td colSpan="6" style={{ background: "#f5f5f5", fontWeight: "bold", padding: "10px" }}>
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

                                                const rowClass = (index + 1) % 2 === 0 ? "evenClass" : "oddClass";

                                                // Calculate discounted price
                                                let discountedPrice;
                                                const milestoneDiscountType = discount_type?.[planType] ?? serviceInfo.discount_type;
                                                const milestoneDiscountValue = discount_value?.[planType] ?? serviceInfo.discount_value;

                                                if (milestoneDiscountType === 1) {
                                                    // Percentage discount
                                                    discountedPrice = (milestone.milestone_price - (milestone.milestone_price * milestoneDiscountValue) / 100).toFixed(2);
                                                } else if (milestoneDiscountType === 2) {
                                                    // Fixed amount discount
                                                    const count = groupedMilestones[planType].length;
                                                    discountedPrice = (milestone.milestone_price - milestoneDiscountValue / Math.max(count, 1)).toFixed(2);
                                                } else {
                                                    // No discount
                                                    discountedPrice = parseFloat(milestone.milestone_price).toFixed(2);
                                                }

                                                return (
                                                    <React.Fragment key={milestone.id}>
                                                        {/* Main milestone row */}
                                                        <tr className={rowClass}>
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
                                                                    {userInfo.user_type === "user" && milestone.status !== 1 && (
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
                                                            {userInfo.user_type === "user" && (
                                                                <td style={{ padding: "8px", border: "1px solid #eee" }}>
                                                                    {(milestone.status === 0 || milestone.status === 4) && (
                                                                        <a href="javascript:" onClick={() => handleDeleteMilestone(milestone.id, milestone.service_id)}>
                                                                            <i className="fa fa-trash-o"></i>
                                                                        </a>
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
                                                    </React.Fragment>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ServiceDetails;

