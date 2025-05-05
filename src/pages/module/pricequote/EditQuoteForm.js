import React, { useState, useEffect, useRef } from 'react';
import QueryInfoTab from './components/QueryInfoTab';
import toast from 'react-hot-toast';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CircleMinus, CirclePlus, X } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditQuoteForm = ({ QueryInfo, selectedServiceId, serviceData, expandStatus, closable, onClose, after }) => {
    const [formData, setFormData] = useState({
        service_price_id: '',
        status: '',
        quotation_id: '',
        ref_id: '',
        quote_heading: '',
        ask_scope_quote: '',
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
            [plan.toLowerCase()]: {
                ...(prev[plan.toLowerCase()] || {}),
                [milestoneId]: value
            }
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

    const [additionalRemarksBasic, setAdditionalRemarksBasic] = useState('');
    const [additionalRemarksStandard, setAdditionalRemarksStandard] = useState('');
    const [additionalRemarksAdvanced, setAdditionalRemarksAdvanced] = useState('');

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
    const handleMilestoneChangeOld = (plan, count) => {

        if (!totalPrices[plan.charAt(0).toUpperCase() + plan.slice(1)]) {
            toast.error("Total price not available for this plan.");
            return;
        }

        const totalPrice = totalPrices[plan.charAt(0).toUpperCase() + plan.slice(1)];
        const splitPrice = Array(count).fill(Math.floor(totalPrice / count));
        for (let i = 0; i < totalPrice % count; i++) {
            splitPrice[i] += 1;
        }

        setMilestone((prev) => {
            const existing = prev[plan.toLowerCase()] || { milestone_name: [], milestone_price: [], submilestoneData: [] };

            const newMilestoneName = [...existing.milestone_name];
            const newMilestonePrice = [...existing.milestone_price];
            const newSubmilestoneData = [...existing.submilestoneData];

            if (count > newMilestoneName.length) {
                // Append new empty values
                for (let i = newMilestoneName.length; i < count; i++) {
                    newMilestoneName.push("");
                    newMilestonePrice.push("");
                    newSubmilestoneData.push({
                        parameters: [],
                        no_of_words: [],
                        time_frame: [],
                    });
                }
            } else {
                // Remove excess items
                newMilestoneName.length = count;
                newMilestonePrice.length = count;
                newSubmilestoneData.length = count;
            }

            return {
                ...prev,
                [plan.toLowerCase()]: {
                    ...existing,
                    count: count,
                    milestone_name: newMilestoneName,
                    milestone_price: newMilestonePrice,
                    submilestoneData: newSubmilestoneData,
                },
            };
        });


    };

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

    const handleParameterChange = (plan, milestoneIndex, paramIndex, field, value) => {
        setMilestone((prevData) => {
            const updatedMilestones = { ...prevData };
            if (!updatedMilestones[plan.toLowerCase()]) return prevData;
            if (!updatedMilestones[plan.toLowerCase()].submilestoneData[milestoneIndex]) return prevData;

            updatedMilestones[plan.toLowerCase()].submilestoneData[milestoneIndex][field][paramIndex] = value;

            return { ...updatedMilestones };
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

            // Convert input value to a number
            const newValue = parseInt(value, 10) || 0;
            currentPlanPrices[milestoneId] = newValue;

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
    const [loading, setLoading] = useState(false);
    const [mileStoneData, setMileStoneData] = useState({});
    const [serviceInfo, setServiceInfo] = useState(null);
    const [serviceMilestoneData, setServiceMilestoneData] = useState({});
    const [milestone, setMilestone] = useState({});

    useEffect(() => {
        console.log(milestone)
    }, [milestone])

    // Function to fetch the quote data
    const fetchQuoteData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'https://99crm.phdconsulting.in/zend/api/userpricequote',
                { ref_id: QueryInfo.assign_id, priceServiceId: selectedServiceId }
            );

            // setQuoteData(response.data.quoteData);
            // setQueryInfo(response.data.queryInfo);
            // setServiceData(response.data.quoteServiceData);
            setFormData(prev => ({
                ...prev,
                service_price_id: response.data.serviceInfo.id || '',
                status: response.data.serviceInfo.status || '',
                quotation_id: response.data.serviceInfo.quotation_id || '',
                ref_id: response.data.serviceInfo.ref_id || '',
                quote_heading: response.data.serviceInfo.quote_heading || '',
                quote_service_id: response.data.serviceInfo.quote_service_id || '',
                select_plan: response.data.serviceInfo.select_plan ? JSON.parse(response.data.serviceInfo.select_plan) : [],
                recommended_plan: response.data.serviceInfo.recommended_plan || '',
                currency_type_basic: response.data.serviceInfo.currency_type ? JSON.parse(response.data.serviceInfo.currency_type).basic : '',
                currency_type_standard: response.data.serviceInfo.currency_type ? JSON.parse(response.data.serviceInfo.currency_type).standard : '',
                total_price_basic: response.data.serviceInfo.total_price ? JSON.parse(response.data.serviceInfo.total_price).basic : '',
                total_price_standard: response.data.serviceInfo.total_price ? JSON.parse(response.data.serviceInfo.total_price).standard : '',
                no_of_milestone_basic: response.data.serviceInfo.milestone ? JSON.parse(response.data.serviceInfo.milestone).basic : '',
                no_of_milestone_standard: response.data.serviceInfo.milestone ? JSON.parse(response.data.serviceInfo.milestone).standard : '',
                discount_type: response.data.serviceInfo.discount_type ? JSON.parse(response.data.serviceInfo.discount_type).basic : '',
                discount_value: response.data.serviceInfo.discount_value ? JSON.parse(response.data.serviceInfo.discount_value).basic : '',
                coupon_code: response.data.serviceInfo.coupon_code ? JSON.parse(response.data.serviceInfo.coupon_code).basic : '',
                expiry_date: response.data.serviceInfo.expiry_date ? new Date(response.data.serviceInfo.expiry_date * 1000) : null,
                order_summary_basic: response.data.serviceInfo.order_summary ? JSON.parse(response.data.serviceInfo.order_summary).basic : '',
                order_summary_standard: response.data.serviceInfo.order_summary ? JSON.parse(response.data.serviceInfo.order_summary).standard : '',
                notSendOnlinePayment: response.data.serviceInfo.notSendOnlinePayment == 1 ? true : false,
                payment_details: response.data.serviceInfo.payment_details || ''
            }));
            setTotalPrices({
                Basic: response.data.serviceInfo.total_price
                    ? JSON.parse(response.data.serviceInfo.total_price).basic
                    : '',
                Standard: response.data.serviceInfo.total_price
                    ? JSON.parse(response.data.serviceInfo.total_price).standard
                    : '',
                Advanced: response.data.serviceInfo.total_price
                    ? JSON.parse(response.data.serviceInfo.total_price).advanced ?? ""
                    : ''
            });
            // Store milestone data in state
            setMileStoneData(response.data.serviceInfo.milestone ? JSON.parse(response.data.serviceInfo.milestone) : {});
            setServiceMilestoneData(response.data.serviceMilestoneData ? response.data.serviceMilestoneData : []);
            setServiceInfo(response.data.serviceInfo ? response.data.serviceInfo : [])
            setMilestone(response.data.milestone ?? {})


            let discountres = response.data.serviceInfo.discount_type
                ? JSON.parse(response.data.serviceInfo.discount_type)
                : {};

            setDiscountType(prev => ({
                ...prev,
                Basic: discountres.basic || "",
                Standard: discountres.standard || "",
                Advanced: discountres.advanced || ""
            }));

            let discountValRes = response.data.serviceInfo.discount_value
                ? JSON.parse(response.data.serviceInfo.discount_value)
                : {};

            let couponCodeRes = response.data.serviceInfo.coupon_code
                ? JSON.parse(response.data.serviceInfo.coupon_code)
                : {};

            setDiscountValue(prev => ({
                ...prev,
                Basic: discountValRes.basic || "",
                Standard: discountValRes.standard || "",
                Advanced: discountValRes.advanced || ""
            }));

            setCouponCode(prev => ({
                ...prev,
                Basic: couponCodeRes.basic || "",
                Standard: couponCodeRes.standard || "",
                Advanced: couponCodeRes.advanced || ""
            }));

            console.log(response.data)

        } catch (error) {
            console.error("Error fetching quote data:", error);
        } finally {
            setLoading(false);
        }
    };
    // Trigger fetch on RefId change or on component mount
    useEffect(() => {
        if (QueryInfo.assign_id) {
            fetchQuoteData();
        }
    }, [QueryInfo.assign_id]);
    useEffect(() => {
        if (mileStoneData) {
            setSelectedMilestones({
                Basic: mileStoneData.basic || '',
                Standard: mileStoneData.standard || '',
                Advanced: mileStoneData.advanced || ''
            });

            // Call handleMilestoneChange after a small delay
            setTimeout(() => {
                Object.entries(mileStoneData).forEach(([plan, value]) => {
                    console.log(plan.charAt(0).toUpperCase() + plan.slice(1), value);
                    // handleMilestoneChange(plan.charAt(0).toUpperCase() + plan.slice(1), value);
                });
            }, 500);
        }
    }, [totalPrices]);

    const setMilesStoneNamesData = () => {

    }
    useEffect(() => {
        if (!Array.isArray(serviceMilestoneData)) {
            console.error("serviceMilestoneData is not an array", serviceMilestoneData);
            return;
        }

        const milestoneNames = serviceMilestoneData.reduce((acc, milestone) => {
            const planType = milestone.plan_type;
            if (!acc[planType]) acc[planType] = {}; // Initialize plan type object

            acc[planType][milestone.id] = milestone.milestone_name; // Use milestone ID as key

            return acc;
        }, {});

        console.log("milestone names is", JSON.stringify(milestoneNames));
        setMilestoneNames(milestoneNames);

        const milestonePrices = serviceMilestoneData.reduce((acc, milestone) => {
            const planType = milestone.plan_type;
            if (!acc[planType]) acc[planType] = {}; // Initialize plan type object

            acc[planType][milestone.id] = milestone.milestone_price; // Use milestone ID as key

            return acc;
        }, {});

        console.log("milestone names is", JSON.stringify(milestoneNames));
        setMilestonePrices(milestonePrices);


    }, [serviceMilestoneData]);

    const [allset, setallset] = useState(false);
    const setParsedMilestones = () => {
        // if (allset) return; 
        setallset(false);
        const parsedData = [];
        serviceMilestoneData.forEach((item) => {
            if (item.plan_type) {
                const data = item.subMilestoneData ? JSON.parse(item.subMilestoneData) : {};
                if (Array.isArray(data)) {
                    parsedData.push(...data);
                } else {
                    parsedData.push(data);
                }
            }
        });
        console.log("milest " + JSON.stringify(milestones));
        ["basic", "standard", "advanced"].forEach((plan) => {
            if (milestones[plan]) { // Ensure the plan exists in milestones
                milestones[plan].forEach((milestone, milestoneIndex) => {
                    if (Array.isArray(milestone.subMilestoneData)) { // Ensure it's an array before mapping
                        milestone.subMilestoneData.forEach((_, subIndex) => {
                            const subMilestoneInput = document.getElementById(`submilestone_${plan.toLowerCase()}_${milestone.id}_${subIndex}`);
                            const wordsInput = document.getElementById(`no_of_words_${plan.toLowerCase()}_${milestone.id}_${subIndex}`);
                            const timeFrameInput = document.getElementById(`time_frame_${plan.toLowerCase()}_${milestone.id}_${subIndex}`);

                            if (subMilestoneInput) {
                                console.log("found")
                                console.log("not found " + JSON.stringify(milestone))
                            } else {
                                console.log(`submilestone_${plan.toLowerCase()}_${milestone.ref_id}_${subIndex}`)
                                console.log("not found " + JSON.stringify(milestone))
                            }
                            if (subMilestoneInput) subMilestoneInput.value = parsedData[milestone.id - 1]?.parameters || "";
                            if (wordsInput) wordsInput.value = parsedData[milestone.id - 1]?.no_of_words || "";
                            if (timeFrameInput) timeFrameInput.value = parsedData[milestone.id - 1]?.time_frame || "";

                        });
                    }
                });
            }
        });
        setallset(true);
        console.log("parseddd" + parsedData)

    }

    const milestoneRef = useRef(null);
    useEffect(() => {
        if (milestoneRef.current) {
            setParsedMilestones();
        }
    }, [serviceMilestoneData]);

    useEffect(() => {
        if (!Array.isArray(serviceMilestoneData)) {
            console.error("serviceMilestoneData is not an array", serviceMilestoneData);
            return;
        }

    }, [serviceMilestoneData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.quote_heading) {
            toast.error('Please enter Quote Heading');
            return;
        }
        if (!formData.ask_scope_quote) {
            toast.error('Please enter AskForScope ID');
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
            if (!additionalRemarks.Basic) {
                toast.error('Please enter Additional Remarks for Basic Plan');
                return;
            }
            if (!additionalRemarksBasic) {
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

            if (!additionalRemarks.Standard) {
                toast.error('Please enter Additional Remarks for Standard Plan');
                return;
            }
            if (!additionalRemarksStandard) {
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
            if (!additionalRemarks.Advanced) {
                toast.error('Please enter Additional Remarks for Advanced Plan');
                return;
            }
            if (!additionalRemarksAdvanced) {
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

        // console.log(milestone['basic'].submilestoneData)
        // return;

        const formattedSubmilestoneBasic = formatSubmilestoneData(subMilestoneData.Basic || {});
        const formattedSubmilestoneStandard = formatSubmilestoneData(subMilestoneData.Standard || {});
        const formattedSubmilestoneAdvanced = formatSubmilestoneData(subMilestoneData.Advanced || {});

        const formattedExpiryDate = new Date(formData.expiry_date).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        // console.log(milestone.basic);
        //     return

        const data = {
            user_id: sessionStorage.getItem('id'),
            user_name: sessionStorage.getItem('name'),
            user_type: sessionStorage.getItem('user_type'),
            accessQuoteApproval: sessionStorage.getItem('accessQuoteApproval'),
            isdraftform: document.getElementById('isdraftform').value,



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
            mile_stone: milestone

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

    useEffect(() => {
        document.getElementById("test").value = "test"
    }, [])

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
                <input type="hidden" id="isdraftform" name="isdraftform" value="no" />
                <input type="hidden" id="test" name="test" value="no" />
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

                        <div className="flex items-center justify-between space-y-1">
                            <label className="text-gray-900 font-semibold text-sm">Ask Scope ID</label>
                            <input
                                type="text"
                                id="ask_scope_quote"
                                name="ask_scope_quote"
                                className="border border-gray-300  w-64 rounded-lg px-3 py-1 outline-none text-sm"
                                placeholder="Enter AskForScope Id"
                                value={formData.ask_scope_quote}
                                onChange={handleChange}
                            />
                            <span id="ask_scope_quoteError" className="text-red-500 text-xs"></span>
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
                                    <label

                                        className="block text-sm font-medium text-gray-700">
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
                                        {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Details
                                    </label>
                                    <textarea
                                        name={`order_summary_${plan}`}
                                        className="w-full p-2 border rounded-md"
                                        value={additionalRemarks[plan]} // Controlled Component
                                        onChange={(e) => handleRemarkChange(plan, e.target.value)}
                                        rows={12}
                                    ></textarea>

                                </div >

                                {plan.toLowerCase().includes("basic") && (
                                    <div className="mb-4 bg-white" id={`${plan}_remark_div`}>
                                        <label className="text-left block text-sm font-medium text-gray-700">
                                            {plan.charAt(0).toUpperCase() + plan.slice(1)} Additional Remarks
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={additionalRemarksBasic}
                                            className='no-uppercase-quill'
                                            onChange={setAdditionalRemarksBasic}
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline'],
                                                    [{ align: [] }],
                                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                                    ['link'],
                                                    ['clean']
                                                ]
                                            }}
                                            placeholder="Enter additional remarks"
                                        />
                                    </div>
                                )}

                                {plan.toLowerCase().includes("standard") && (
                                    <div className="mb-4 bg-white" id={`${plan}_remark_div`}>
                                        <label className="text-left block text-sm font-medium text-gray-700">
                                            {plan.charAt(0).toUpperCase() + plan.slice(1)} Additional Remarks
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={additionalRemarksStandard}
                                            className='no-uppercase-quill'
                                            onChange={setAdditionalRemarksStandard}
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline'],
                                                    [{ align: [] }],
                                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                                    ['link'],
                                                    ['clean']
                                                ]
                                            }}
                                            placeholder="Enter additional remarks"
                                        />
                                    </div>
                                )}

                                {plan.toLowerCase().includes("advanced") && (
                                    <div className="mb-4 bg-white" id={`${plan}_remark_div`}>
                                        <label className="text-left block text-sm font-medium text-gray-700">
                                            {plan.charAt(0).toUpperCase() + plan.slice(1)} Additional Remarks
                                        </label>
                                        <ReactQuill
                                            theme="snow"
                                            value={additionalRemarksAdvanced}
                                            className='no-uppercase-quill'
                                            onChange={setAdditionalRemarksAdvanced}
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline'],
                                                    [{ align: [] }],
                                                    [{ list: 'ordered' }, { list: 'bullet' }],
                                                    ['link'],
                                                    ['clean']
                                                ]
                                            }}
                                            placeholder="Enter additional remarks"
                                        />
                                    </div>
                                )}

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

                    {(sessionStorage.getItem("user_type") == "admin" || sessionStorage.getItem("user_type") == "sub-admin") && (serviceData && serviceData.status == 2) ? (
                        <div className="form-group mt-2">
                            <div className="col-sm-12 flex justify-end">
                                <button type="submit" className="btn btn-primary"
                                    onClick={(e) => {
                                        document.getElementById("isdraftform").value = "no";
                                    }}
                                >Submit</button>
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center justify-between'>
                            <div className="form-group mt-2">
                                <div className="col-sm-12 flex justify-end">
                                    <button type="submit"
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            document.getElementById("isdraftform").value = "yes";
                                        }}
                                    >Save as draft</button>
                                </div>
                            </div>
                            <div className="form-group mt-2">
                                <div className="col-sm-12 flex justify-end">
                                    <button type="submit"
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            document.getElementById("isdraftform").value = "no";
                                        }}
                                    >Submit</button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </form>
        </div>
    );
};

export default EditQuoteForm;