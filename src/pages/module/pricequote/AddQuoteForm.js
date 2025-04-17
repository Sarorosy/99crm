import React, { useEffect, useState } from 'react';
import QueryInfoTab from './components/QueryInfoTab';
import toast from 'react-hot-toast';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, CircleMinus, CirclePlus } from 'lucide-react';


const AddQuoteForm = ({ QueryInfo, serviceData, expandStatus, closable, onClose, after }) => {
    const [formData, setFormData] = useState({
        service_price_id: '',
        status: '',
        quotation_id: '',
        ref_id: '',
        quote_heading: '',
        quote_service_id: '',
        select_plan: [],
        recommended_plan: '',
        currency_type_basic: '',
        total_price_basic: '',
        no_of_milestone_basic: '',
        order_summary_basic: '',
        currency_type_standard: '',
        total_price_standard: '',
        no_of_milestone_standard: '',
        order_summary_standard: '',
        currency_type_advanced: '',
        total_price_advanced: '',
        no_of_milestone_advanced: '',
        order_summary_advanced: '',
        discount_type: '',
        discount_value: '',
        coupon_code: '',
        expiry_date: '',
        notSendOnlinePayment: false,
        payment_details: ''
    });
    const paymentData = QueryInfo.paymentData ? JSON.parse(QueryInfo.paymentData) : [];

    const handleCurrencyChange = (plan, value, url) => {
        setFormData((prev) => ({
            ...prev,
            [`currency_type_${plan.toLowerCase()}`]: value,
            [`payment_url_${plan.toLowerCase()}`]: url || "", // Store the corresponding payment URL
        }));
    };

    const [milestoneNames, setMilestoneNames] = useState({});
    const handleMilestoneNameChange = (plan, milestoneId, value) => {
        setMilestoneNames((prev) => ({
            ...prev,
            [plan]: {
                ...prev[plan],
                [milestoneId]: value,
            },
        }));
    };
    const [subMilestoneData, setSubMilestoneData] = useState({});
    const handleSubMilestoneChange = (plan, milestoneId, subIndex, field, value) => {
        setSubMilestoneData((prev) => ({
            ...prev,
            [plan]: {
                ...prev[plan],
                [milestoneId]: {
                    ...prev[plan]?.[milestoneId],
                    [field]: {
                        ...prev[plan]?.[milestoneId]?.[field],
                        [subIndex]: value,
                    },
                },
            },
        }));
    };

    const [discountType, setDiscountType] = useState({
        Basic: "",
        Standard: "",
        Advanced: ""
    });

    const [discountValue, setDiscountValue] = useState({
        Basic: "",
        Standard: "",
        Advanced: ""
    });

    const [couponCode, setCouponCode] = useState({
        Basic: "",
        Standard: "",
        Advanced: ""
    });

    const handleDiscountTypeChange = (plan, value) => {
        setDiscountType(prev => ({ ...prev, [plan]: value }));
    };

    const handleDiscountValueChange = (plan, value) => {
        setDiscountValue(prev => ({ ...prev, [plan]: value }));
    };

    const handleCouponCodeChange = (plan, value) => {
        setCouponCode(prev => ({ ...prev, [plan]: value }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: checked
                    ? [...prevFormData[name], value] // Add value if checked
                    : prevFormData[name].filter((item) => item !== value) // Remove if unchecked
            }));
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleNotPaymentCheckboxChange = (e) => {
        const { name, checked } = e.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: checked ? 1 : 0, // Set 1 if checked, 0 if unchecked
        }));
    };

    const [totalPrices, setTotalPrices] = useState({});
    const [additionalRemarks, setAdditionalRemarks] = useState({
        Basic: `1. Quote provided is for Rapid Collaborate Basic Plan.
    2. Revision policy: Post the delivery of the work, we have a revision policy wherein you can ask for 1 revision per milestone for the delivered work without any additional charges.
    3. Modifications should be asked on the current milestone, and we will not be able to make the changes to the previous milestones post approval. Change in the topic, objectives, or results will not be possible after the approval.`,

        Standard: `1. Quote provided is for Rapid Collaborate Standard Plan.
    2. Revision policy: Post the delivery of the work, we have a revision policy wherein you can ask for up to 3 revisions per milestone for the delivered work without any additional charges.
    3. Modifications should be asked on the current milestone, and we will not be able to make the changes to the previous milestones post approval. Change in the topic, objectives, or results will not be possible after the approval.`,

        Advanced: `1. Quote provided is for Rapid Collaborate Advanced Plan.
    2. Revision policy: Post the delivery of the work, we have a revision policy wherein you can ask for unlimited revisions per milestone for the delivered work without any additional charges.
    3. Modifications should be asked on the current milestone, and we will not be able to make the changes to the previous milestones post approval. Change in the topic, objectives, or results will not be possible after the approval.`,
    });

    const handleRemarkChange = (plan, value) => {
        setAdditionalRemarks((prev) => ({
            ...prev,
            [plan]: value,
        }));
    };
    const handleDateChange = (date) => {
        setFormData((prev) => ({
            ...prev,
            expiry_date: date,
        }));
    };


    const [selectedMilestones, setSelectedMilestones] = useState({});
    const [milestonePrices, setMilestonePrices] = useState({});
    const handlePriceChange = (plan, value) => {
        setTotalPrices((prev) => ({
            ...prev,
            [plan]: value,
        }));
        setFormData((prev) => ({
            ...prev,
            [`total_price_${plan.toLowerCase()}`]: value, // Sync to formData
        }));
    };
    const [milestones, setMilestones] = useState({
        Basic: [],
        Standard: [],
        Advanced: [],
    });


    const [milestone, setMilestone] = useState({});
    const handleMilestoneChange = (plan, count) => {
        if (!totalPrices[plan.charAt(0).toUpperCase() + plan.slice(1)]) {
            toast.error("Please enter price for this plan.");
            return;
        }

        const totalPrice = totalPrices[plan.charAt(0).toUpperCase() + plan.slice(1)];
        const splitPrice = Array(count).fill(Math.floor(totalPrice / count));

        // Adjust any remainder
        for (let i = 0; i < totalPrice % count; i++) {
            splitPrice[i] += 1;
        }

        setMilestone((prev) => {
            const existing = prev[plan.toLowerCase()] || { milestone_name: [], milestone_price: [], submilestoneData: [] };

            const newMilestoneName = [...existing.milestone_name];
            const newSubmilestoneData = [...existing.submilestoneData];

            if (count > newMilestoneName.length) {
                for (let i = newMilestoneName.length; i < count; i++) {
                    newMilestoneName.push("");
                    newSubmilestoneData.push({
                        parameters: [],
                        no_of_words: [],
                        time_frame: [],
                    });
                }
            } else {
                newMilestoneName.length = count;
                newSubmilestoneData.length = count;
            }

            return {
                ...prev,
                [plan.toLowerCase()]: {
                    ...existing,
                    count: count,
                    milestone_name: newMilestoneName,
                    milestone_price: splitPrice,  // Set evenly split prices
                    submilestoneData: newSubmilestoneData,
                },
            };
        });
    };
    const handleMilestoneInputChange = (plan, milestoneIndex, field, value) => {
        setMilestone((prev) => {
            const updatedMilestones = { ...prev };
            const planKey = plan.toLowerCase();

            if (!updatedMilestones[planKey]) return prev;

            updatedMilestones[planKey][field][milestoneIndex] = value;

            return { ...updatedMilestones };
        });
    };

    const handleParameterChange = (plan, milestoneIndex, paramIndex, field, value) => {
        setMilestone((prevData) => {
            const updatedMilestones = { ...prevData };
            if (!updatedMilestones[plan.toLowerCase()]) return prevData;
            if (!updatedMilestones[plan.toLowerCase()].submilestoneData[milestoneIndex]) return prevData;

            updatedMilestones[plan.toLowerCase()].submilestoneData[milestoneIndex][field][paramIndex] = value;

            return { ...updatedMilestones };
        });
    };
    const handleAddParameter = (plan, milestoneIndex) => {
        setMilestone((prevMilestone) => {
            return {
                ...prevMilestone,
                [plan.toLowerCase()]: {
                    ...prevMilestone[plan.toLowerCase()],
                    submilestoneData: {
                        ...prevMilestone[plan.toLowerCase()]?.submilestoneData,
                        [milestoneIndex]: {
                            parameters: [...(prevMilestone[plan.toLowerCase()]?.submilestoneData?.[milestoneIndex]?.parameters || []), ""],
                            no_of_words: [...(prevMilestone[plan.toLowerCase()]?.submilestoneData?.[milestoneIndex]?.no_of_words || []), ""],
                            time_frame: [...(prevMilestone[plan.toLowerCase()]?.submilestoneData?.[milestoneIndex]?.time_frame || []), ""]
                        }
                    }
                }
            };
        });
    };

    const handleRemoveParameter = (plan, milestoneIndex, paramIndex) => {
        setMilestone((prevMilestone) => {
            const updatedMilestone = { ...prevMilestone };
            const planKey = plan.toLowerCase();

            if (updatedMilestone[planKey]?.submilestoneData?.[milestoneIndex]) {
                updatedMilestone[planKey].submilestoneData[milestoneIndex].parameters.splice(paramIndex, 1);
                updatedMilestone[planKey].submilestoneData[milestoneIndex].no_of_words.splice(paramIndex, 1);
                updatedMilestone[planKey].submilestoneData[milestoneIndex].time_frame.splice(paramIndex, 1);
            }

            return { ...updatedMilestone };
        });
    };
    useEffect(() => {
        console.log(milestone)
    }, [milestone])



    const addMoreSubmilestone = (plan, milestoneIndex) => {
        setMilestones((prev) => ({
            ...prev,
            [plan]: prev[plan].map((milestone, index) =>
                index === milestoneIndex
                    ? {
                        ...milestone,
                        subMilestoneData: [
                            ...milestone.subMilestoneData,
                            { parameters: "", no_of_words: "", time_frame: "" },
                        ],
                    }
                    : milestone
            ),
        }));
    };
    const removeSubmilestone = (plan, milestoneIndex, subIndex) => {
        setMilestones((prev) => ({
            ...prev,
            [plan]: prev[plan].map((milestone, index) =>
                index === milestoneIndex
                    ? {
                        ...milestone,
                        subMilestoneData: milestone.subMilestoneData.filter((_, i) => i !== subIndex),
                    }
                    : milestone
            ),
        }));
    };
    const handleMilestonePriceChange = (plan, milestoneId, value) => {
        setMilestonePrices((prev) => {
            const currentPlanPrices = { ...prev[plan] };
            const totalPrice = parseFloat(totalPrices[plan]) || 0;

            // Convert the input value to a number
            const newValue = parseInt(value, 10) || 0;

            // Update the selected milestone price
            currentPlanPrices[milestoneId] = newValue;

            // Calculate total assigned amount
            const totalAssigned = Object.values(currentPlanPrices).reduce((sum, val) => sum + val, 0);
            const remaining = totalPrice - totalAssigned;

            // Find first and last milestone IDs
            const milestoneIds = Object.keys(currentPlanPrices).map(Number).sort((a, b) => a - b);
            const firstMilestoneId = milestoneIds[0];
            const lastMilestoneId = milestoneIds[milestoneIds.length - 1];

            if (milestoneId === lastMilestoneId) {
                // If last milestone is changed, adjust the first milestone
                currentPlanPrices[firstMilestoneId] += remaining;
            } else {
                // If any other milestone is changed, adjust the last milestone
                currentPlanPrices[lastMilestoneId] += remaining;
            }

            return { ...prev, [plan]: currentPlanPrices };
        });
    };




    const formatSubmilestoneData = (data) => {
        return Object.keys(data).map((milestoneId) => {
            return {
                parameters: Object.values(data[milestoneId]?.parameters || {}),
                no_of_words: Object.values(data[milestoneId]?.no_of_words || {}),
                time_frame: Object.values(data[milestoneId]?.time_frame || {}),
            };
        });
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.quote_heading) {
            toast.error('Please enter Quote Heading');
            return;
        }
        if (!formData.quote_service_id) {
            toast.error('Please select Service');
            return;
        }
        if (formData.select_plan.length === 0) {
            toast.error('Please select Atleast one Plan');
            return;
        }
        if (!formData.recommended_plan) {
            toast.error('Please select Recommended Plan');
            return;
        }
        if (formData.select_plan.includes('Basic')) {
            if (!formData.currency_type_basic) {
                toast.error('Please select Currency Type for Basic Plan');
                return;
            }
            if (!formData.total_price_basic) {
                toast.error('Please enter Total Price for Basic Plan');
                return;
            }
            if (!milestone.basic.count) {
                toast.error('Please select No of Milestones for Basic Plan');
                return;
            }
            if (!additionalRemarks.Basic) {
                toast.error('Please enter Additional Remarks for Basic Plan');
                return;
            }
            if (!discountType.Basic) {
                toast.error('Please select a Discount Type for Basic Plan');
                return;
            }
            if (["1", "2"].includes(discountType.Basic)) {
                if (!discountValue.Basic) {
                    toast.error('Please enter Discount Value for Basic Plan');
                    return;
                }
                if (!couponCode.Basic) {
                    toast.error('Please enter Coupon Code for Basic Plan');
                    return;
                }
            }


        }

        if (formData.select_plan.includes('Standard')) {
            if (!formData.currency_type_standard) {
                toast.error('Please select Currency Type for Standard Plan');
                return;
            }
            if (!formData.total_price_standard) {
                toast.error('Please enter Total Price for Standard Plan');
                return;
            }
            if (!milestone.standard.count) {
                toast.error('Please select No of Milestones for Standard Plan');
                return;
            }
            if (!additionalRemarks.Standard) {
                toast.error('Please enter Additional Remarks for Standard Plan');
                return;
            }
            if (!discountType.Standard) {
                toast.error('Please select a Discount Type for Standard Plan');
                return;
            }
            if (["1", "2"].includes(discountType.Standard)) {
                if (!discountValue.Standard) {
                    toast.error('Please enter Discount Value for Standard Plan');
                    return;
                }
                if (!couponCode.Standard) {
                    toast.error('Please enter Coupon Code for Standard Plan');
                    return;
                }
            }

        }

        if (formData.select_plan.includes('Advanced')) {
            if (!formData.currency_type_advanced) {
                toast.error('Please select Currency Type for Advanced Plan');
                return;
            }
            if (!formData.total_price_advanced) {
                toast.error('Please enter Total Price for Advanced Plan');
                return;
            }
            if (!milestone.advanced.count) {
                toast.error('Please select No of Milestones for Advanced Plan');
                return;
            }
            if (!additionalRemarks.Advanced) {
                toast.error('Please enter Additional Remarks for Advanced Plan');
                return;
            }
            if (!discountType.Advanced) {
                toast.error('Please select a Discount Type for Advanced Plan');
                return;
            }
            if (["1", "2"].includes(discountType.Advanced)) {
                if (!discountValue.Advanced) {
                    toast.error('Please enter Discount Value for Advanced Plan');
                    return;
                }
                if (!couponCode.Advanced) {
                    toast.error('Please enter Coupon Code for Advanced Plan');
                    return;
                }
            }

        }

        if (!formData.expiry_date) {
            toast.error('Please select Expiry Date');
            return;
        }

        const formattedSubmilestoneBasic = formatSubmilestoneData(subMilestoneData.Basic || {});
        const formattedSubmilestoneStandard = formatSubmilestoneData(subMilestoneData.Standard || {});
        const formattedSubmilestoneAdvanced = formatSubmilestoneData(subMilestoneData.Advanced || {});

        const formattedExpiryDate = new Date(formData.expiry_date).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });

        const data = {
            user_id: sessionStorage.getItem('id'),
            user_name: sessionStorage.getItem('name'),
            user_type: sessionStorage.getItem('user_type'),
            accessQuoteApproval: sessionStorage.getItem('accessQuoteApproval'),


            service_price_id: formData.service_price_id,
            status: formData.status,
            quotation_id: formData.quotation_id,
            ref_id: QueryInfo.assign_id,
            quote_heading: formData.quote_heading,
            quote_service_id: formData.quote_service_id,
            select_plan: formData.select_plan,
            recommended_plan: formData.recommended_plan,

            //for basic
            currency_type_basic: formData.currency_type_basic,
            total_price_basic: formData.total_price_basic,
            payment_url_basic: formData.payment_url_basic,
            no_of_milestone_basic: milestone.basic ? milestone.basic.count : 0,
            milestone_name_basic: milestone.basic ? milestone.basic.milestone_name : [],
            milestone_price_basic: milestone.basic ? milestone.basic.milestone_price : [],
            submilestone_basic: milestone.basic ? milestone.basic.submilestoneData : [],
            order_summary_basic: additionalRemarks.Basic,
            milestone_remark_basic: [],

            //for standard
            currency_type_standard: formData.currency_type_standard,
            total_price_standard: formData.total_price_standard,
            payment_url_standard: formData.payment_url_standard,
            no_of_milestone_standard: milestone.standard ? milestone.standard.count : 0,
            milestone_name_standard: milestone.standard ? milestone.standard.milestone_name : [],
            milestone_price_standard: milestone.standard ? milestone.standard.milestone_price : [],
            submilestone_standard: milestone.standard ? milestone.standard.submilestoneData : [],
            order_summary_standard: additionalRemarks.Standard,
            milestone_remark_standard: [],

            //for advanced
            currency_type_advanced: formData.currency_type_advanced,
            total_price_advanced: formData.total_price_advanced,
            payment_url_advanced: formData.payment_url_advanced,
            no_of_milestone_advanced: milestone.advanced ? milestone.advanced.count : 0,
            milestone_name_advanced: milestone.advanced ? milestone.advanced.milestone_name : [],
            milestone_price_advanced: milestone.advanced ? milestone.advanced.milestone_price : [],
            submilestone_advanced: milestone.advanced ? milestone.advanced.submilestoneData : [],
            order_summary_advanced: additionalRemarks.Advanced,
            milestone_remark_advanced: [],

            discount_type_basic: discountType.Basic,
            discount_value_basic: discountValue.Basic,
            coupon_code_basic: couponCode.Basic,

            discount_type_standard: discountType.Standard,
            discount_value_standard: discountValue.Standard,
            coupon_code_standard: couponCode.Standard,

            discount_type_advanced: discountType.Advanced,
            discount_value_advanced: discountValue.Advanced,
            coupon_code_advanced: couponCode.Advanced,


            expiry_date: formattedExpiryDate,
            notSendOnlinePayment: formData.notSendOnlinePayment ? 1 : 0,
            payment_details: formData.payment_details,

        };

        const accessQuoteApproval = sessionStorage.getItem('accessQuoteApproval') == 'Yes';

        const apiUrl = accessQuoteApproval
            ? "https://99crm.phdconsulting.in/zend/api/send-price-quote-"
            : "https://99crm.phdconsulting.in/zend/api/send-price-quote-for-approval-";

        try {
            const response = await fetch("https://99crm.phdconsulting.in/zend/api/send-price-quote-for-approval", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.status) {
                toast.success("Quote sent successfully!");
                onClose();
                after();
            } else {
                toast.error(result.message || "Failed to send quote.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className='flex flex-col space-y-2 p-1 border'>
            {closable && (
                <div className="flex justify-end items-center space-x-2">
                    <button className='bg-red-600 text-white p-1 rounded-full w-7 flex items-center justify-center ' onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
            )}
            <form className="form-horizontal" name="priceQuoteForm" id="priceQuoteForm" method="post" onSubmit={handleSubmit}>
                <input type="hidden" name="service_price_id" value={formData.service_price_id} />
                <input type="hidden" name="status" value={formData.status} />
                <input type="hidden" name="quotation_id" value={formData.quotation_id} />
                <input type="hidden" name="ref_id" value={formData.ref_id} />
                <div className="box-body">
                    <QueryInfoTab QueryInfo={QueryInfo} expandStatus={expandStatus} />

                    <div className={`grid gap-4 ${expandStatus ? "grid-cols-3" : "grid-cols-1"} mt-2 text-sm bg-blue-50 py-3 px-3 rounded`}>
                        {/* Quote Heading */}
                        <div className="flex items-center justify-between space-y-1">
                            <label className="text-gray-900 font-semibold text-sm">Quote Heading</label>
                            <input
                                type="text"
                                id="quote_heading"
                                name="quote_heading"
                                className="border border-gray-300  w-64 rounded-lg px-3 py-1 outline-none text-sm"
                                placeholder="Enter Quote Heading"
                                value={formData.quote_heading}
                                onChange={handleChange}
                            />
                            <span id="quote_headingError" className="text-red-500 text-xs"></span>
                        </div>

                        {/* Service Selection */}
                        <div className="flex items-center justify-between space-y-1">
                            <label className="text-gray-900 font-semibold text-sm">Service</label>
                            <select
                                name="quote_service_id"
                                id="quote_service_id"
                                className="border border-gray-300 w-64 rounded-lg px-3 py-1 outline-none text-sm"
                                value={formData.quote_service_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Service</option>
                                {serviceData?.map((service, index) => (
                                    <option key={index} value={service.id}>
                                        {service.quote_service_name}
                                    </option>
                                ))}
                            </select>
                            <span id="quote_service_idError" className="text-red-500 text-xs"></span>
                        </div>

                        {/* Select Plan */}
                        <div className="flex items-center justify-between space-y-1">
                            <label className="text-gray-900 font-semibold text-sm">Select Plan</label>
                            <div className="flex flex-col space-y-2">
                                {["Basic", "Standard", "Advanced"].map((plan) => (
                                    <label key={plan} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            name="select_plan"
                                            value={plan}
                                            checked={formData.select_plan.includes(plan)}
                                            onChange={handleChange}
                                            className="rounded border-gray-300 text-blue-500 "
                                        />
                                        <span>{plan}</span>
                                    </label>
                                ))}
                            </div>
                            <span id="select_planError" className="text-red-500 text-xs"></span>
                        </div>
                    </div>

                    {formData.select_plan && formData.select_plan.length > 0 && (
                        <div className="flex flex-col space-y-2 bg-blue-50 py-3 px-3 rounded mt-2">
                            <label className="text-gray-700 font-medium text-sm">Recommended Plan</label>
                            <div className="flex space-x-4">
                                {["Basic", "Standard", "Advanced"].map((plan) => {
                                    const isDisabled = !formData.select_plan.includes(plan); // Disable if not in select_plan

                                    return (
                                        <label
                                            key={plan}
                                            className={`flex items-center font-semibold space-x-2 text-sm text-gray-900 ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="recommended_plan"
                                                value={plan}
                                                checked={formData.recommended_plan === plan}
                                                onChange={handleChange}
                                                disabled={isDisabled}
                                                className="hidden"
                                            />
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 ${formData.recommended_plan === plan
                                                    ? "bg-[#006c81] border-[#006c81]"
                                                    : "border-gray-400"
                                                    } flex items-center justify-center`}
                                            >
                                                {formData.recommended_plan === plan && (
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                )}
                                            </div>
                                            <span>{plan}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <span id="recommended_planError" className="text-red-500 text-xs"></span>
                        </div>
                    )}

                    <div className={`grid gap-2 ${expandStatus ? 'grid-cols-3' : 'grid-cols-1'} mt-2 `}>
                        {["Basic", "Standard", "Advanced"].map((plan) => (
                            <div
                                key={plan}
                                className={`p-2 mb-6 rounded-lg shadow-md ${plan}-set-bg`}
                                id={`${plan}PriceFields`}
                                style={{
                                    display: formData.select_plan.includes(plan) ? "block" : "none",

                                }}

                            >
                                <label className="text-lg font-semibold text-gray-800 ">
                                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                </label>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Total Price ({plan})
                                    </label>
                                    <div className="flex space-x-3">
                                        <select
                                            className="w-1/3 p-2 border rounded-md "
                                            name={`currency_type_${plan}`}
                                            value={formData[`currency_type_${plan.toLowerCase()}`]}
                                            onChange={(e) => {
                                                const selectedOption = e.target.options[e.target.selectedIndex]; // Get the selected <option>
                                                const paymentUrl = selectedOption.getAttribute("dataUrl"); // Extract dataUrl from the option
                                                handleCurrencyChange(plan, e.target.value, paymentUrl);
                                            }}
                                        >
                                            <option value="">Currency</option>
                                            {paymentData.length > 0
                                                ? paymentData.map((data) => (
                                                    <option key={data.currency_type} value={data.currency_type} dataUrl={data.payment_url}>
                                                        {data.currency_type}
                                                    </option>
                                                ))
                                                : ["INR", "USD", "GBP", "AUD", "EUR", "MYR", "SGD", "ZAR"].map(
                                                    (curr) => (
                                                        <option key={curr} value={curr} dataUrl="">
                                                            {curr}
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                        <input
                                            className="w-2/3 p-2 border rounded-md "
                                            name={`total_price_${plan}`}
                                            placeholder={`Enter Total Price for ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
                                            value={totalPrices[plan] || ""}
                                            onChange={(e) => handlePriceChange(plan, e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        No of Milestones {plan.charAt(0).toUpperCase() + plan.slice(1)}
                                    </label>
                                    <select
                                        name={`no_of_milestone_${plan}`}
                                        className="w-full p-2 border rounded-md "
                                        onClick={() => { console.log(selectedMilestones[plan]) }}
                                        value={milestone[plan.toLowerCase()]?.count || ""}
                                        onChange={(e) => handleMilestoneChange(plan.toLowerCase(), parseInt(e.target.value))}
                                    >
                                        <option value="">Select Milestones</option>
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {milestone[plan.toLowerCase()] &&
                                    Array.from({ length: milestone[plan.toLowerCase()].count }).map((_, milestoneIndex) => (
                                        <div key={milestone.id} className="mb-4 border rounded-md p-3 bg-gray-100">
                                            {/* Milestone Name */}
                                            <input
                                                className="form-control w-full mb-2 p-1 border rounded-md"
                                                name={`milestone_name_${plan}[]`}
                                                id={`milestone_name_${plan}_${milestone.id}`}
                                                placeholder={`Milestone Name `}
                                                value={milestone[plan.toLowerCase()].milestone_name[milestoneIndex]}
                                                onChange={(e) => handleMilestoneInputChange(plan, milestoneIndex, "milestone_name", e.target.value)}

                                                required
                                            />

                                            {/* Milestone Price */}
                                            <input
                                                className="form-control w-full mb-2 p-1 border rounded-md"
                                                name={`milestone_price_${plan}[]`}
                                                id={`milestone_price_${plan}_${milestone.id}`}
                                                placeholder="Milestone Price"
                                                value={milestone[plan.toLowerCase()].milestone_price[milestoneIndex]}
                                                onChange={(e) => handleMilestoneInputChange(plan, milestoneIndex, "milestone_price", e.target.value)}
                                            />

                                            {/* Parameters Table */}
                                            <table className="w-full border bg-white rounded-md">
                                                <thead>
                                                    <tr className="bg-blue-100">
                                                        <th className="p-2 border">Parameters</th>
                                                        <th className="p-2 border">No. of Words</th>
                                                        <th className="p-2 border">Time Frame</th>
                                                        <th className="p-2 border">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {milestone[plan.toLowerCase()]?.submilestoneData?.[milestoneIndex] &&
                                                        (milestone[plan.toLowerCase()].submilestoneData[milestoneIndex]?.parameters.length > 0
                                                            ? milestone[plan.toLowerCase()].submilestoneData[milestoneIndex].parameters.map((parameter, paramIndex) => (
                                                                <tr key={`${milestoneIndex}-${paramIndex}`}>
                                                                    <td className="p-2 border">
                                                                        <textarea
                                                                            name={`submilestone_${plan}[subMilestoneData][${milestone.id}][parameters][]`}
                                                                            className="form-control w-full p-1"
                                                                            defaultValue={parameter || ""}
                                                                            onChange={(e) => handleParameterChange(plan, milestoneIndex, paramIndex, 'parameters', e.target.value)}
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        <input
                                                                            type="text"
                                                                            name={`submilestone_${plan}[subMilestoneData][${milestone.id}][no_of_words][]`}
                                                                            className="form-control w-full p-1"
                                                                            defaultValue={milestone[plan.toLowerCase()].submilestoneData[milestoneIndex]?.no_of_words?.[paramIndex] || ""}
                                                                            onChange={(e) => handleParameterChange(plan, milestoneIndex, paramIndex, 'no_of_words', e.target.value)}
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        <input
                                                                            type="text"
                                                                            name={`submilestone_${plan}[subMilestoneData][${milestone.id}][time_frame][]`}
                                                                            className="form-control w-full p-1"
                                                                            defaultValue={milestone[plan.toLowerCase()].submilestoneData[milestoneIndex]?.time_frame?.[paramIndex] || ""}
                                                                            onChange={(e) => handleParameterChange(plan, milestoneIndex, paramIndex, 'time_frame', e.target.value)}
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border">
                                                                        {paramIndex != 0 ? (
                                                                            <button className="btn btn-danger btn-sm" onClick={() => handleRemoveParameter(plan, milestoneIndex, paramIndex)}>
                                                                                <CircleMinus size={18} className="text-white" />
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                type='button'
                                                                                className="btn btn-info btn-sm"
                                                                                onClick={() => handleAddParameter(plan, milestoneIndex)}
                                                                            >
                                                                                <CirclePlus size={18} className="text-white" />
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                            : // If no parameters exist, render an empty row with default values
                                                            <tr key={`${milestoneIndex}-empty`}>
                                                                <td className="p-2 border">
                                                                    <textarea
                                                                        name={`submilestone_${plan}[subMilestoneData][${milestone.id}][parameters][]`}
                                                                        className="form-control w-full p-1"
                                                                        defaultValue=""
                                                                        onChange={(e) => handleParameterChange(plan, milestoneIndex, 0, 'parameters', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="p-2 border">
                                                                    <input
                                                                        type="text"
                                                                        name={`submilestone_${plan}[subMilestoneData][${milestone.id}][no_of_words][]`}
                                                                        className="form-control w-full p-1"
                                                                        defaultValue=""
                                                                        onChange={(e) => handleParameterChange(plan, milestoneIndex, 0, 'no_of_words', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="p-2 border">
                                                                    <input
                                                                        type="text"
                                                                        name={`submilestone_${plan}[subMilestoneData][${milestone.id}][time_frame][]`}
                                                                        className="form-control w-full p-1"
                                                                        defaultValue=""
                                                                        onChange={(e) => handleParameterChange(plan, milestoneIndex, 0, 'time_frame', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="p-2 border">
                                                                    <button
                                                                        type='button'
                                                                        className="btn btn-info btn-sm"
                                                                        onClick={() => handleAddParameter(plan, milestoneIndex)}
                                                                    //onClick={() => addMoreSubMilestone(plan.toLowerCase(), milestone.id)}
                                                                    >
                                                                        <CirclePlus size={18} className="text-white" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    }



                                                </tbody>
                                            </table>
                                        </div>
                                    ))
                                }

                                <div className="mb-4" id={`${plan}_remark_div`}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {plan.charAt(0).toUpperCase() + plan.slice(1)} Additional Remarks
                                    </label>
                                    <textarea
                                        name={`order_summary_${plan}`}
                                        className="w-full p-2 border rounded-md"
                                        value={additionalRemarks[plan]} // Controlled Component
                                        onChange={(e) => handleRemarkChange(plan, e.target.value)}
                                        rows={12}
                                    ></textarea>

                                </div >
                                <div className="flex items-end justify-between space-x-1 mb-4">
                                    <div className="w-50">
                                        <label className="text-left block text-sm font-medium text-gray-700">{plan} Discount Type</label>
                                        <select
                                            name={`discount_type_${plan.toLowerCase()}`}
                                            className="w-full p-2 border rounded-md"
                                            value={discountType[plan]}
                                            onChange={(e) => handleDiscountTypeChange(plan, e.target.value)}
                                        >
                                            <option value="">Discount Type</option>
                                            <option value="1">Percentage</option>
                                            <option value="2">Fixed</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>

                                    {["1", "2"].includes(discountType[plan]) && (
                                        <div className="w-50">
                                            <input
                                                type="text"
                                                name={`discount_value_${plan.toLowerCase()}`}
                                                className="w-full p-2 border rounded-md"
                                                placeholder="Discount Value"
                                                value={discountValue[plan]}
                                                onChange={(e) => handleDiscountValueChange(plan, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                                {["1", "2"].includes(discountType[plan]) && (
                                    <div className="mb-4">
                                        <label className="text-left block text-sm font-medium text-gray-700">Coupon Code ({plan})</label>
                                        <input
                                            type="text"
                                            name={`coupon_code_${plan.toLowerCase()}`}
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Please Enter Coupon Code"
                                            value={couponCode[plan]}
                                            onChange={(e) => handleCouponCodeChange(plan, e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg shadow-md max-w-lg mx-auto">


                        {/* Expiry Date */}
                        <div className="mb-4">
                            <label className="block text-gray-600 font-medium mb-1">Expiry Date</label>
                            <DatePicker
                                selected={formData.expiry_date}
                                onChange={handleDateChange}
                                dateFormat="MM/dd/yyyy"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300"
                                placeholderText="Select Expiry Date"
                            />
                        </div>

                        {/* Checkbox - Do Not Send for Online Payment */}
                        <div className="mb-4 flex items-center">
                            <input
                                type="checkbox"
                                name="notSendOnlinePayment"
                                id="notSendOnlinePayment"
                                className="mr-2 w-4 h-4 accent-blue-500"
                                checked={formData.notSendOnlinePayment === 1}
                                onChange={handleNotPaymentCheckboxChange}
                            />
                            <label htmlFor="notSendOnlinePayment" className="text-gray-700 font-medium">
                                Do not send for online payment
                            </label>
                        </div>

                        {/* Payment Details (If checkbox is checked) */}
                        {formData.notSendOnlinePayment === 1 && (
                            <div className="mb-4">
                                <label className="block text-gray-600 font-medium mb-1">Payment Details</label>
                                <textarea
                                    name="payment_details"
                                    id="payment_details"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300"
                                    value={formData.payment_details}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter Payment Details"
                                ></textarea>
                                <span id="payment_detailsError" className="text-red-500 text-sm"></span>
                            </div>
                        )}
                    </div>


                    <div className="form-group mt-2">
                        <div className="col-sm-12 flex justify-end">
                            <button type="submit" className="btn btn-primary" >Submit</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddQuoteForm;