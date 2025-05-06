import React, { useState, useEffect } from 'react';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css'; // or any other theme you prefer
import toast from 'react-hot-toast';
import { CheckCircle, Settings, Plus, Minus } from 'lucide-react';
import CommentForm from './CommentForm';
import HistoryComponent from './HistoryComponent';
import moment from "moment";
import { getSocket } from '../../../Socket';

const EmailDiv = ({ queryInfo, templateInfo, commentInfo, whatsappOptions, callOptions, after, onClose, fetchDashboardQueriesForSocket }) => {
  
  const socket = getSocket();
  const [status, setStatus] = useState(queryInfo.update_status);
  const [remainderDate, setRemainderDate] = useState(
    queryInfo.remainder_date
      ? new Date(queryInfo.remainder_date * 1000).toISOString().split("T")[0]
      : ''
  );
  const [showRemainderDiv, setShowRemainderDiv] = useState(queryInfo.update_status == 7);
  const [showccField, setccShowField] = useState(false);
  const [showbccField, setbccShowField] = useState(false);
  const [emailBody, setEmailBody] = useState(queryInfo.email_body || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(queryInfo.subject || '');
  const [attachments, setAttachments] = useState([]);
  const [commentsFile, setCommentsFile] = useState([]);
  const [emailSignature, setEmailSignature] = useState(queryInfo.signature || '');
  const userType = sessionStorage.getItem('user_type');
  const [sendType, setSendType] = useState('now');
  const [sendLaterDate, setSendLaterDate] = useState(null);
  const [approveCounter, setApproveCounter] = useState(0);
  const [templateApproved, setTemplateApproved] = useState(false);
  const [emailCheckBoxChecked, setEmailCheckBoxChecked] = useState(false);
  const [emailDivVisible, setEmailDivVisible] = useState(queryInfo.update_status == 1 ? true : false);

  const [submitBtnDisabled, setSubmitBtnDisabled] = useState(true);
  const [commentsTabVisible, setCommentsTabVisible] = useState(false);

  // for whatsapp 
  const [whatsappCheckBoxChecked, setWhatsappCheckBoxChecked] = useState(false);
  const [whatsappCheckBoxDisabled, setWhatsappCheckBoxDisabled] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [filteredWhatsappOptions, setFilteredWhatsappOptions] = useState([]);
  const [whatsappSubOptionDisplay, setWhatsappSubOptionDisplay] = useState(false);
  const [subOptions, setSubOptions] = useState([]);
  const [subSubOptions, setSubSubOptions] = useState([]);
  const [isDateTimeInput, setIsDateTimeInput] = useState(false);
  const [callLaterDate, setCallLaterDate] = useState("");
  const [callLaterTime, setCallLaterTime] = useState("");
  const [isDiscussionInput, setIsDiscussionInput] = useState(false);
  const [discussionLabel, setDiscussionLabel] = useState("");
  const [whatsappDiscussionComments, setWhatsappDiscussionsComments] = useState('');
  const [subOptionsValues, setSubOptionsValues] = useState(
    new Array(subOptions.length).fill("") // Initialize an empty array for storing values
  );

  // for call 
  const [callCheckBoxChecked, setCallCheckBoxChecked] = useState(false);
  const [callCheckBoxDisabled, setCallCheckBoxDisabled] = useState(false);
  const [filteredCallOptions, setFilteredCallOptions] = useState([]);
  const [callsubOptions, setCallSubOptions] = useState([]);
  const [callSubSubOptions, setCallSubSubOptions] = useState([]);
  const [selectedCallOption, setSelectedCallOption] = useState(null);
  const [isCallDateTimeInput, setIsCallDateTimeInput] = useState(false);
  const [isCallDiscussionInput, setIsCallDiscussionInput] = useState(false);
  const [callDiscussionLabel, setCallDiscussionLabel] = useState("");
  const [callcallLaterDate, setCallCallLaterDate] = useState("");
  const [callcallLaterTime, setCallCallLaterTime] = useState("");
  const [callDiscussionComments, setCallDiscussionsComments] = useState('');
  const [callSubOptionDisplay, setCallSubOptionDisplay] = useState(false);
  const [callSubOptionsValues, setCallSubOptionsValues] = useState(
    new Array(subOptions.length).fill("") // Initialize an empty array for storing values
  );

  const [phdCheckBoxChecked, setPhdCheckBoxChecked] = useState(queryInfo.explain_phd_planer == 1 || queryInfo.explain_phd_planer == 1);
  const [phdCheckBoxDisabled, setPhdCheckBoxDisabled] = useState(queryInfo.explain_phd_planer == 1 || queryInfo.explain_phd_planer == 1);


  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setShowRemainderDiv(newStatus == '7');
    setSelectedCallOption(null);
    setSelectedOption(null);

    const oldStatus = queryInfo.update_status;
    let showStatus = `${oldStatus}-${newStatus}`;

    if (oldStatus == 9) showStatus = "1-2";
    if ((oldStatus == 8 && newStatus == 2) || (oldStatus == 3 && newStatus == 2)) showStatus = "1-2";
    if (oldStatus == 8 && newStatus == 6) showStatus = "1-6";


    // Filter WhatsApp options based on status
    const filteredOptions = whatsappOptions.filter(
      (opt) => opt.status_from + "-" + opt.status_to == showStatus
    );
    setFilteredWhatsappOptions(filteredOptions);

    const filteredCallOptions = callOptions.filter(
      (opt) => opt.status_from + "-" + opt.status_to == showStatus
    );
    setFilteredCallOptions(filteredCallOptions);

    // Disable WhatsApp checkbox based on conditions
    const disableCheckbox = ["4", "5", "7", "8", "9", "10"].includes(newStatus);

    //setWhatsappCheckBoxChecked(!disableCheckbox);
    setWhatsappCheckBoxDisabled(disableCheckbox);
    setCallCheckBoxDisabled(disableCheckbox);

  };

  const handleOptionChange = (event) => {
    const selectedId = event.target.value;
    setSelectedOption(selectedId);
    console.log(selectedId);
    if (selectedId == 3 || selectedId == 18 || selectedId == 20 || selectedId == 24 || selectedId == 26 || selectedId == 27 || selectedId == 28 || selectedId == 29) {
      setIsDateTimeInput(false);
      setIsDiscussionInput(false);
      setWhatsappSubOptionDisplay(true)
      const selectedData = filteredWhatsappOptions.find(
        (opt) => opt.id === parseInt(selectedId)
      );

      
      


      // Extract and split sub_options if available
      if (selectedData?.sub_option) {
        setSubOptions(selectedData.sub_option.split("||"));
      } else {
        setSubOptions([]);
      }

      if (selectedData?.sub_sub_option) {
        setSubSubOptions(selectedData.sub_sub_option.split("~~"));
      } else {
        setSubSubOptions([]);
      }

    } else if (selectedId == 2 || selectedId == 17 || selectedId == 23) {
      setWhatsappSubOptionDisplay(true)
      setIsDiscussionInput(false);
      const selectedData = filteredWhatsappOptions.find(
        (opt) => opt.id === parseInt(selectedId)
      );
      setIsDateTimeInput(true);
      setSubOptions(selectedData.sub_option.split("||")); // Clear sub-options for this case
      setSubSubOptions([]);
    } else if (selectedId == 4 || selectedId == 11 || selectedId == 19 || selectedId == 25) {
      setWhatsappSubOptionDisplay(true)
      const selectedData = filteredWhatsappOptions.find(
        (opt) => opt.id === parseInt(selectedId)
      );
      setIsDiscussionInput(true); // New state to show discussion comment field
      setDiscussionLabel(selectedData?.sub_option?.split("-")[1] || "Discussion");
    } else {
      setIsDateTimeInput(false);
      setIsDiscussionInput(false);
      setWhatsappSubOptionDisplay(false)
    }


  };

  const handleCallOptionChange = (event) => {
    const selectedId = event.target.value;
    setSelectedCallOption(selectedId);
    console.log(selectedId)
    if (selectedId == 5 || selectedId == 16 || selectedId == 18 || selectedId == 20 || selectedId == 22 || selectedId == 23 || selectedId == 24 || selectedId == 25) {
      setCallSubOptionDisplay(true)
      setIsCallDateTimeInput(false);
      setIsCallDiscussionInput(false);
      const selectedData = filteredCallOptions.find(
        (opt) => opt.id === parseInt(selectedId)
      );

      


      // Extract and split sub_options if available
      if (selectedData?.sub_option) {
        setCallSubOptions(selectedData.sub_option.split("||"));
      } else {
        setCallSubOptions([]);
      }

      if (selectedData?.sub_sub_option) {
        setCallSubSubOptions(selectedData.sub_sub_option.split("~~"));
      } else {
        setCallSubSubOptions([]);
      }

    } else if (selectedId == 4 || selectedId == 15 || selectedId == 19) {
      setCallSubOptionDisplay(true)
      setIsDiscussionInput(false);
      const selectedData = filteredCallOptions.find(
        (opt) => opt.id === parseInt(selectedId)
      );
      setIsCallDateTimeInput(true);
      setCallSubOptions(selectedData.sub_option.split("||")); // Clear sub-options for this case
      setCallSubSubOptions([]);
    } else if (selectedId == 6 || selectedId == 10 || selectedId == 17 || selectedId == 21) {
      const selectedData = filteredCallOptions.find(
        (opt) => opt.id === parseInt(selectedId)
      );
      setCallSubOptionDisplay(true)
      setIsCallDateTimeInput(false);
      setIsCallDiscussionInput(true); // New state to show discussion comment field
      setCallDiscussionLabel(selectedData?.sub_option?.split("-")[1] || "Discussion");
    } else {
      setIsCallDateTimeInput(false);
      setIsCallDiscussionInput(false);
      setCallSubOptionDisplay(false);
    }

  };


  const handleSubOptionChange = (index, value) => {
    const updatedValues = [...subOptionsValues];
    updatedValues[index] = value;
    setSubOptionsValues(updatedValues);
  };

  const handleCallSubOptionChange = (index, value) => {
    const updatedValues = [...subOptionsValues];
    updatedValues[index] = value;
    setCallSubOptionsValues(updatedValues);
  };
  const checkSubmitButtonState = () => {
    const allFieldsFilled =
      subOptionsValues.every(value => value != "") &&
      (isDateTimeInput ? (callLaterDate != "" && callLaterTime != "") : true) &&
      subOptions.length > 0;
    setSubmitBtnDisabled(!allFieldsFilled);
  };

  // Call this function whenever relevant states change
  // useEffect(() => {
  //   checkSubmitButtonState();
  // }, [subOptionsValues, callLaterDate, callLaterTime, subOptions, selectedOption]);

  const handleAddFile = () => {
    setCommentsFile([...commentsFile, null]);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = commentsFile.filter((_, i) => i !== index);
    setCommentsFile(updatedFiles);
  };

  const handleFileChange = (index, file) => {
    const updatedFiles = [...commentsFile];
    updatedFiles[index] = file;
    setCommentsFile(updatedFiles);
  };

  const calculateTatTimer = (openDate) => {
    if (!openDate) return { totalHours: 0, totalMinutes: 0 };

    const date1 = new Date(openDate * 1000); // Convert Unix timestamp to milliseconds
    const date2 = new Date(); // Current date

    const diffMs = date2 - date1; // Difference in milliseconds
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60)); // Convert to hours
    const totalMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); // Convert to minutes

    return { totalHours, totalMinutes };
  };


  const handleDateChange = (event) => {
    setCallLaterDate(event.target.value);
  };

  // Handle changes for time input
  const handleTimeChange = (event) => {
    setCallLaterTime(event.target.value);
  };

  const handleCallDateChange = (event) => {
    setCallCallLaterDate(event.target.value);
  };

  // Handle changes for time input
  const handleCallTimeChange = (event) => {
    setCallCallLaterTime(event.target.value);
  };

  // Function to handle template change
  const handleTemplateChange = async (templateId) => {
    try {
      const response = await fetch('https://99crm.phdconsulting.in/zend/api/get-template-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: 'tbl_email_template',
          id: templateId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch template info');
      }

      const data = await response.json();

      if (data.status && data.templateInfo) {
        // Update email body and subject
        setEmailBody(data.templateInfo.mail_body);
        setSubject(data.templateInfo.mail_subject);
      }
    } catch (error) {
      console.error('Error fetching template info:', error);
    }
  };

  const handleCcClick = (e) => {
    e.preventDefault();
    setccShowField(!showccField);
  };

  const handleBccClick = (e) => {
    e.preventDefault();
    setbccShowField(!showbccField);
  };

  const approveTemplate = (type) => {
    if (type === 4 || type === 5) {
      let temp_body = emailBody;
      temp_body = temp_body.replace(/(^\s*)|(\s*$)/gi, ""); // Remove start and end whitespace
      temp_body = temp_body.replace(/[ ]{2,}/gi, " "); // Convert 2 or more spaces to 1
      temp_body = temp_body.replace(/\n /, "\n"); // Exclude newline with a start spacing
      const temp_body_words = temp_body.split(' ').length;

      if (temp_body_words < 10) {
        toast.error("Please enter minimum 10 words for template content");
        return false;
      }
    }

    if (!subject && type === 1) {
      toast.error("Please enter email subject");
      return false;
    } else if (!queryInfo.website_email && type === 1) {
      toast.error("Please enter from email id");
      return false;
    } else if (!emailBody) {
      toast.error("Please enter template content");
      return false;
    } else if (!emailSignature && type === 1) {
      toast.error("Please enter mail signature");
      return false;
    } else if (type === 1 && sendType === 'later' && !sendLaterDate) {
      toast.error("Please select schedule date.");
      return false;
    } else if (showccField && cc == "") {
      toast.error("Please enter cc.");
      return false;
    } else if (showbccField && bcc == "") {
      toast.error("Please enter bcc.");
      return false;
    } else {
      setApproveCounter(approveCounter + 1); // Increment approve counter
      setTemplateApproved(true);
      toast.success("Template approved successfully!");

    }
  };

  const ClickAndCheckMailType = (type, arrTags, updateStatus) => {
    const totalTag = arrTags.length; // Get the total count of tags
    const currentStatus = updateStatus;

    if (totalTag < 2 && currentStatus > 1) {
      alert("Please select at least 2 tags.");
      return false;
    }

    if (type == 3) {
      if (whatsappCheckBoxChecked) {
        setWhatsappCheckBoxChecked((prev) => !prev);
      } else {
        if (status == queryInfo.update_status) {
          toast.error("Please Change Status First")
        } else {
          setWhatsappCheckBoxChecked((prev) => !prev);
        }

      }

      return;
    }

    if (type == 4) {
      if (callCheckBoxChecked) {
        setCallCheckBoxChecked((prev) => !prev);
      } else {
        if (status == queryInfo.update_status) {
          toast.error("Please Change Status First")
        } else {
          setCallCheckBoxChecked((prev) => !prev);
        }
      }
      return;
    }


    if (emailCheckBoxChecked) {
      setEmailCheckBoxChecked((prev) => !prev);
      //setTemplateApproved((prev) => !prev); 
      setEmailDivVisible((prev) => !prev)

    } else {
      setEmailCheckBoxChecked((prev) => !prev);
      //setTemplateApproved((prev) => !prev); 
      setEmailDivVisible((prev) => !prev)

    }


  };

  const callSubOptions = document.querySelectorAll('[name="call_sub_sub_option_value[]"]');

  const allFilled = Array.from(callSubOptions).map(option => {
    if (option.tagName === 'SELECT') {
      // For select, check if it has a value selected that is not the empty option
      return option.value.trim() !== "" && option.value !== "default" ? "yes" : "no";
    } else if (option.tagName === 'INPUT' || option.tagName === 'TEXTAREA') {
      // For textboxes, check if it has a non-empty value
      return option.value.trim() !== "" ? "yes" : "no";
    }
    return "yes";  // If it's neither a select, input, or textarea, assume it's filled
  });

  const isAllFilled = !allFilled.includes("no");

  const whatsappSubOptions = document.querySelectorAll('[name="whatsapp_sub_sub_option_value[]"]');

  const whatsappallFilled = Array.from(whatsappSubOptions).map(option => {
    if (option.tagName === 'SELECT') {
      // For select, check if it has a value selected that is not the empty option
      return option.value.trim() !== "" && option.value !== "default" ? "yes" : "no";
    } else if (option.tagName === 'INPUT' || option.tagName === 'TEXTAREA') {
      // For textboxes, check if it has a non-empty value
      return option.value.trim() !== "" ? "yes" : "no";
    }
    return "yes";  // If it's neither a select, input, or textarea, assume it's filled
  });

  const isWhatsappAllFilled = !whatsappallFilled.includes("no");


  const handleSubmitButtonClick = (queryInfo, arrTag, remainderDate) => {
    console.log("arr" + arrTag)
    const totalTag = arrTag.length;
    const currentStatus = queryInfo.update_status;




    // Validation logic
    if (totalTag < 2 && currentStatus > 1) {
      toast.error("Please select at least 2 tags.");
      return false;
    } else if (status == 7 && !remainderDate) {
      toast.error("Please select a reminder date.");
      document.getElementById("remainder_date").focus();
      return false;
    } else if (queryInfo.profile_name == "") {
      toast.error("Please update query profile.");
      return false;
    } else if (
      queryInfo.update_status != 1 &&
      queryInfo.email_id != '' &&
      queryInfo.update_status != status &&
      !emailCheckBoxChecked
    ) {
      toast.error("Please check email template.");
      return false;
    } else if (
      queryInfo.update_status == 1 &&
      status != 2 &&
      status != 6 &&
      status != 9
    ) {
      toast.error("Please change query status.");
      document.getElementById("update_status1").focus();
      return false;
    } else if (
      queryInfo.update_status == 1 &&
      queryInfo.email_id != '' &&
      !templateApproved &&
      status != 9
    ) {
      toast.error("Please approve mail template.");
      return false;
    } else if (
      queryInfo.update_status != 1 &&
      queryInfo.email_id != '' &&
      status == 6 &&
      !emailCheckBoxChecked
    ) {
      toast.error("Please check email template.");
      return false;
    } else if (
      queryInfo.email_id != '' &&
      emailCheckBoxChecked &&
      !templateApproved
    ) {
      toast.error("Please approve email template.");
      return false; // &&!selectedCallOption && selectedCallOption ==""
    } else if (
      callCheckBoxChecked && !selectedCallOption
    ) {
      console.log(isAllFilled)
      toast.error("Please select call option.");
      return false;
    } else if (
      callCheckBoxChecked && selectedCallOption && callSubOptionDisplay && allFilled.includes("no")
    ) {
      console.log(isAllFilled)
      toast.error("Please select call Sub option.");
      return false;
    } else if (
      callCheckBoxChecked && isCallDateTimeInput && !callcallLaterDate && !callcallLaterTime
    ) {
      toast.error("Please select Call later Date & Time.");
      return false;
    } else if (
      whatsappCheckBoxChecked && !selectedOption
    ) {
      console.log("selected option", selectedOption)
      toast.error("Please select Whatsapp option.");
      return false;
    } else if (
      whatsappCheckBoxChecked && selectedOption && whatsappSubOptionDisplay && whatsappallFilled.includes("no")
    ) {
      console.log(whatsappallFilled)
      toast.error("Please select whatsapp Sub option.");
      return false;
    } else if (
      whatsappCheckBoxChecked && isDateTimeInput && !callLaterDate && !callLaterTime
    ) {
      toast.error("Please select Call later Date & Time.");
      return false;
    } else if (
      queryInfo.CommentInfo?.length > 0 &&
      queryInfo.email_id != '' &&
      !emailCheckBoxChecked &&
      !whatsappCheckBoxChecked &&
      !callCheckBoxChecked &&
      status != 9 &&
      status != 10
    ) {
      toast.error("Please check option to Email box, Call box, or Whatsapp box.");
      return false;
    } else if (
      queryInfo.update_status != status &&
      status != 4 &&
      status != 5 &&
      status != 6 &&
      status != 7 &&
      status != 8 &&
      !whatsappCheckBoxChecked &&
      !callCheckBoxChecked &&
      status != 9 &&
      queryInfo.update_status != 9 &&
      status != 10
    ) {
      toast.error("Please check at least one option: Call box or Whatsapp box.");
      return false;
    }


    handleSubmit();
    return true;
  };

  const handleSubmit = async (event) => {


    const queryOpenDate = queryInfo.open_date ? queryInfo.open_date : null;
    const { totalHours, totalMinutes } = calculateTatTimer(queryOpenDate);


    const formData = new FormData();
    formData.append("in_time", queryInfo.open_date);
    formData.append("assign_id", queryInfo.assign_id);
    formData.append("query_id", queryInfo.id);
    formData.append("old_status", queryInfo.update_status);
    formData.append("update_status1", status);
    formData.append("remainder_date", remainderDate);
    formData.append("mail_from_email", queryInfo.website_email);
    formData.append("mail_to", queryInfo.email_id);
    formData.append("email_cc", cc);
    formData.append("email_bcc", bcc);
    formData.append("mail_subject", subject);
    formData.append("email_temp_body", emailBody);
    formData.append("mail_signature", emailSignature);
    formData.append("sendType", sendType);
    formData.append("scheduleTime", sendLaterDate);
    formData.append("approveStatus1", 1);
    formData.append("whatsappoptvalue", selectedOption);
    formData.append("approveStatus4", 1);
    formData.append("current_tag", queryInfo.tags);
    formData.append("asnqry_transfer_type", queryInfo.transfer_type);
    formData.append("asnqry_trans_repli_user", queryInfo.trans_repli_user);
    formData.append("totalHours", totalHours);
    formData.append("totalMinutes", totalMinutes);
    formData.append("comments", "");
    commentsFile.forEach((file) => {
      if (file) {
        formData.append("comments_file[]", file); // Append each file correctly
      }
    });

    if (emailCheckBoxChecked) formData.append("send_mail_type[]", "Email");
    if (whatsappCheckBoxChecked) formData.append("send_mail_type[]", "Whatsapp");
    if (callCheckBoxChecked) formData.append("send_mail_type[]", "Call");

    // Adding dynamic WhatsApp sub-options
    formData.append("whatsapp_sub_sub_option_key[]", "Academic Level of the client");
    formData.append("whatsapp_sub_sub_option_value[]", "Bachelor's");
    formData.append("whatsapp_sub_sub_option_key[]", "Current Stage of the client");
    formData.append("whatsapp_sub_sub_option_value[]", "Not yet admitted");
    formData.append("whatsapp_sub_sub_option_key[]", "Broad Topic/Domain");
    formData.append("whatsapp_sub_sub_option_value[]", "Testtt");
    formData.append("whatsapp_sub_sub_option_key[]", "Assistance Needed");
    formData.append("whatsapp_sub_sub_option_value[]", "Topic and Proposal");

    // Adding dynamic Call sub-options
    formData.append("call_sub_sub_option_key[]", "Academic Level of the client");
    formData.append("call_sub_sub_option_value[]", "Bachelor's");
    formData.append("call_sub_sub_option_key[]", "Current Stage of the client");
    formData.append("call_sub_sub_option_value[]", "Not yet admitted");
    formData.append("call_sub_sub_option_key[]", "Broad Topic/Domain");
    formData.append("call_sub_sub_option_value[]", "Test");
    formData.append("call_sub_sub_option_key[]", "Assistance Needed");
    formData.append("call_sub_sub_option_value[]", "Questionnaire designing");
    formData.append('user_id', sessionStorage.getItem('id'))
    formData.append('user_name', sessionStorage.getItem('name'))
    formData.append('user_type', sessionStorage.getItem('user_type'))
    if (!phdCheckBoxDisabled) {
      formData.append("explain_phd_planer", phdCheckBoxChecked ? 1 : 0);
    }

    // Adding file upload (Assuming you have file input state)
    // Example: formData.append("comments_file[]", selectedFile);

    try {
      const response = await fetch("https://99crm.phdconsulting.in/zend/api/commentsubmit", {
        method: "POST",
        body: formData,
      });
      console.log(response)
      const result = await response.json();

      if (result.status) {
        console.log("Form submitted successfully!", response);
          socket.emit("query_status_updated", {
            query_id: queryInfo.assign_id,
            user_id: queryInfo.user_id,
            status : status,
          })
        toast.success("Submitted successfully!");
        setEmailCheckBoxChecked(false);
        setEmailDivVisible(false);
        setTemplateApproved(false);
        setEmailBody('')
        setWhatsappCheckBoxChecked(false);
        setCallCheckBoxChecked(false);
        after();
        if(fetchDashboardQueriesForSocket){
          fetchDashboardQueriesForSocket();
        }
        
       // onClose();

      } else {
        console.error("Error submitting form:", response);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  return (
    <div className='px-3 py-2'>
      <form name="viewDetailsForm" id="viewDetailsForm" method="post" style={{ width: '100%' }}>
        <input type="hidden" name="in_time" value={queryInfo.open_date} />
        <input type="hidden" name="assign_id" value={queryInfo.assign_id} />
        <input type="hidden" name="query_id" value={queryInfo.id} />
        <input type="hidden" name="old_status" value={queryInfo.update_status} />

        {userType !== 'Data Manager' && (
          <div className="flex flex-row items-start justify-content-between gap-4 qhpage">
            {/* Left Side - Label */}
            <div className="w-1/4">
              <label className="text-sm font-medium text-gray-700">Status</label>
            </div>

            {/* Right Side - Select and Additional Elements */}
            <div className="col-md-3 space-y-2">
              {/* Select Dropdown */}
              <select
                name="update_status1"
                id="update_status1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="1">Lead In</option>
                <option value="2">Contact Made</option>
                <option value="6">Client Not Interested</option>
                <option value="9">Contact Not Made</option>
                {commentInfo && commentInfo.length > 0 && (
                  <>
                    <option value="3">Quoted</option>
                    <option value="5">Converted</option>
                    <option value="7">Reminder</option>
                  </>
                )}
                <option value="10">Cross Sell</option>
              </select>

              <div className='flex items-center justify-end space-x-3 my-2'>
                {showRemainderDiv && (
                  <div id="remainder_div" className="mt-2">
                    <input
                      type="date"
                      name="remainder_date"
                      id="remainder_date"
                      value={remainderDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => setRemainderDate(e.target.value)}
                    />
                  </div>
                )}

                {/* Shifted Date */}
                {queryInfo.update_status_date && (
                  <span className="block text-xs text-gray-600">
                    Shifted Date:{" "}
                    {new Date(
                      queryInfo.update_status_date * 1000 // Convert seconds to milliseconds
                    ).toLocaleDateString()}
                  </span>
                )}

                {/* Next Followup Date */}
                {queryInfo.followupInfo && queryInfo.followupInfo.followup_day && (
                  <div className="text-xs text-gray-600">
                    Next Followup Date:{" "}
                    <span>{new Date(queryInfo.followupInfo.followup_day).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {commentsTabVisible ? (
          <CommentForm onClose={() => { setCommentsTabVisible(!commentsTabVisible) }} queryInfo={queryInfo} status={status} after={after} />
        ) : (
          <div className="col-md-12" id="emailCommentsDiv">
            {userType !== 'Data Manager' && queryInfo.email_id && (
              <>
                <div>
                  <div className=" bg-white p-2 rounded-lg  border border-gray-200 qhpage">
                    <div className="checkbox">
                      <label className='flex items-center space-x-3 mb-0'>
                        {queryInfo.update_status == '1' ? (
                          <input
                            type="checkbox"
                            className='h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
                            checked={queryInfo.update_status == '1' && queryInfo.email_id != ''}
                            disabled={queryInfo.update_status == '1'}

                          />
                        ) : (
                          <input
                            type="checkbox"
                            id="send_mail_type1"
                            className='h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
                            checked={emailCheckBoxChecked}
                            onChange={() => { ClickAndCheckMailType(1, queryInfo.arrTags ?? [], queryInfo.update_status) }}
                          />
                        )}
                        <span className='ml-3 text-gray-800'>Email</span>

                      </label>
                    </div>

                    <div id="send_mail_type1Div" style={{ display: emailDivVisible ? "block" : "none" }}>
                      <div className=" w-full flex justify-end items-end  ">
                        <div className='col-md-4 dashboardinput'>
                          <select
                            onChange={(e) => handleTemplateChange(e.target.value)}
                            className="block w-full px-2 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                          >
                            <option value="" disabled selected>
                              {templateInfo && templateInfo.length > 0 ? 'Choose Template' : 'Mail Template'}
                            </option>
                            {templateInfo && templateInfo.length > 0 ? (
                              templateInfo.map((template) => (
                                <option key={template.id} value={template.id}>
                                  {template.template_name}
                                </option>
                              ))
                            ) : (
                              <option disabled>Template not found.</option>
                            )}
                          </select>
                        </div>

                      </div>

                      {!templateApproved ? (
                        <div>
                          <div className="mt-2 mx-auto bg-white  rounded-lg py-2">
                            <div className='d-flex gap-2'>
                              <div className='w-1/2'>
                                <div className="mb-3">
                                  <label className="block font-semibold">From:</label>
                                  <input type="text" className="w-full border rounded px-3 py-2" value={queryInfo.website_email} />
                                </div>
                              </div>

                              <div className='w-1/2'>
                                <div className="mb-3" disabled>
                                  <label className="block font-semibold">To:</label>
                                  <input type="text" className="w-full border rounded px-3 py-2" value={queryInfo.email_id} readOnly disabled />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-4 mb-4">
                              <button type="button" className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleCcClick}>CC</button>
                              <button type="button" className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleBccClick}>BCC</button>
                            </div>

                            {showccField && (
                              <div className="mb-4">
                                <label className="block font-semibold">CC:</label>
                                <input type="text" className="w-full border rounded px-3 py-2" value={cc} onChange={(e) => setCc(e.target.value)} />
                              </div>
                            )}

                            {showbccField && (
                              <div className="mb-4">
                                <label className="block font-semibold">BCC:</label>
                                <input type="text" className="w-full border rounded px-3 py-2" value={bcc} onChange={(e) => setBcc(e.target.value)} />
                              </div>
                            )}

                            <div className="mb-4">
                              <label className="block font-semibold">Subject:</label>
                              <input type="text" className="w-full border rounded px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
                            </div>

                            <div className="mb-4">
                              <label className="block font-semibold">Email Body:</label>
                              <ReactQuill theme="snow" value={emailBody} onChange={setEmailBody} className="bg-white" />
                            </div>

                            <div className="mb-4">
                              <label className="block font-semibold">Attachments:</label>
                              {commentsFile.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                  <input
                                    type="file"
                                    className="w-full border rounded px-1 py-1"
                                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                                  />
                                  <button
                                    type="button"
                                    className="text-danger"
                                    onClick={() => handleRemoveFile(index)}
                                  >
                                    <Minus size={12} />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                className="mt-2 px-2 py-1 bg-blue-500 text-white rounded flex items-center gap-1"
                                onClick={handleAddFile}
                              >
                                <Plus size={12} /> Add File
                              </button>
                            </div>

                            <div className="mb-4">
                              <label className="block font-semibold">Email Signature:</label>
                              <ReactQuill theme="snow" value={emailSignature} onChange={setEmailSignature} className="bg-white" />
                            </div>
                            <div className='flex justify-between'>
                              <div className="flex gap-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="sendType"
                                    value="now"
                                    className="mr-2"
                                    checked={sendType === 'now'}
                                    onChange={() => setSendType('now')}
                                  />
                                  Send Now
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="sendType"
                                    value="later"
                                    className="mr-2"
                                    checked={sendType === 'later'}
                                    onChange={() => setSendType('later')}
                                  />
                                  Send Later
                                </label>
                              </div>

                              {sendType === 'later' && (
                                <div className="w-1/2 flex dashboardinput">
                                  <label className="block font-semibold" style={{ fontSize: "11px" }}>Schedule Date and Time:</label>
                                  <Flatpickr
                                    value={sendLaterDate}
                                    onChange={([date]) => setSendLaterDate(date)}
                                    options={{
                                      enableTime: true,
                                      dateFormat: "Y-m-d H:i",
                                      minDate: "today",
                                    }}
                                    className="w-full px-3 py-2 border rounded"
                                  />
                                </div>
                              )}
                            </div>

                            <div className='d-flex justify-content-end mt-2'>
                              <button
                                type="button"
                                className="bg-orange-500 text-white px-2 py-1 rounded fssx"
                                onClick={() => approveTemplate(1)}
                              >
                                Approve
                              </button>
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-5 py-2 my-4 0 rounded-lg">
                          <div className="flex items-center bg-green-100 text-green-800 border border-green-40 px-2 py-1 rounded">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span>Template Approved</span>
                          </div>
                          <button
                            onClick={() => setTemplateApproved(false)}
                            className="flex items-center ml-4 text-sm bg-blue-100 text-blue-800 border border-blue-40 px-2 py-1 rounded focus:outline-none"
                          >
                            <Settings className="w-5 h-5 mr-2" />
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='mt-3'>
                  <div className="bg-white p-2 rounded-lg  border border-gray-200 qhpage">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="whatsapp_checkbox"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        checked={whatsappCheckBoxChecked}
                        disabled={whatsappCheckBoxDisabled}
                        onChange={() => ClickAndCheckMailType(3, queryInfo.arrTags ?? [], queryInfo.update_status)}
                      />
                      <label htmlFor="whatsapp_checkbox" className="text-green-900 font-medium select-none mb-0">
                        WhatsApp
                      </label>
                      <input type="hidden" name="send_mail_type[]" id="send_mail_type3" value="WhatsApp" />
                    </div>

                    {whatsappCheckBoxChecked && !whatsappCheckBoxDisabled && (
                      <div className="mt-3">
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-gray-700"
                          onChange={handleOptionChange}
                        >
                          <option value="">Select an Option</option>
                          {filteredWhatsappOptions.map((whatsappOptValueData) => (
                            <option
                              key={whatsappOptValueData.id}
                              value={whatsappOptValueData.id}
                              data-status={`${whatsappOptValueData.status_from}-${whatsappOptValueData.status_to}`}
                            >
                              {whatsappOptValueData.option_val}
                            </option>
                          ))}
                        </select>
                        {whatsappSubOptionDisplay && (
                          isDiscussionInput ? (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <div className="w-1/6 font-medium">{discussionLabel}</div>
                              <div className="w-2/3">
                                <input
                                  type="text"
                                  name="whatsappopt_discussion_comments"
                                  id="whatsappopt_discussion_comments"
                                  className="border p-2 w-full"
                                  value={whatsappDiscussionComments}
                                  onChange={(e) => { setWhatsappDiscussionsComments(e.target.value) }}
                                  required
                                />
                              </div>
                            </div>
                          ) : isDateTimeInput ? (
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="w-1/6 font-medium">{subOptions[0].split("-")[1]}</div>
                              <div className="w-2/6">
                                <input
                                  type="date"
                                  name="whatsappopt_call_later_date"
                                  id="whatsappopt_call_later_date"
                                  className="border p-2 w-full"
                                  value={callLaterDate}
                                  onChange={handleDateChange}
                                />
                              </div>
                              <div className="w-2/6">
                                <input
                                  type="time"
                                  name="whatsappopt_call_later_time"
                                  id="whatsappopt_call_later_time"
                                  className="border p-2 w-full"
                                  value={callLaterTime}
                                  onChange={handleTimeChange}
                                />
                              </div>
                            </div>
                          ) : (
                            !isDiscussionInput && !isDateTimeInput && subOptions.length > 0 && (
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subOptions.map((subOpt, index) => {
                                  const [subOptId, subOptName] = subOpt.split("-");
                                  const subSubOptionData = subSubOptions[index] || "";
                                  const subSubValues = subSubOptionData.split("|||");

                                  // Determine input type
                                  let inputType = "text";
                                  if (subOptName === "When to reconnect with the client") {
                                    inputType = "datetime-local";
                                  }

                                  return (
                                    <div key={index} className="flex flex-col gap-2">
                                      <label className="font-medium">{subOptName}:</label>
                                      {subSubValues[0].split("-")[1] === "Blank" ? (
                                        <input
                                          type={inputType}
                                          name="whatsapp_sub_sub_option_value[]"
                                          className="border p-2 w-full"
                                          value={subOptionsValues[index]} // Bind the state value
                                          onChange={(e) => handleSubOptionChange(index, e.target.value)}
                                          required
                                        />
                                      ) : (
                                        <select
                                          name="whatsapp_sub_sub_option_value[]"
                                          className="border p-2 w-full"
                                          value={subOptionsValues[index]} // Bind the state value
                                          onChange={(e) => handleSubOptionChange(index, e.target.value)}
                                          required
                                        >
                                          <option value="">Select {subOptName}</option>
                                          {subSubValues.map((value, i) => {
                                            const [, optionValue] = value.split("-");
                                            return (
                                              <option key={i} value={optionValue}>
                                                {optionValue}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )
                          )
                        )}

                        {/* /////////end//////// */}
                      </div>
                    )}
                  </div>

                </div>

                <div className='mt-3'>
                  <div className="bg-white p-2 rounded-lg  border border-gray-200 qhpage">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="call_checkbox"
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        checked={callCheckBoxChecked}
                        disabled={callCheckBoxDisabled}
                        onChange={() => ClickAndCheckMailType(4, queryInfo.arrTags ?? [], queryInfo.update_status)}
                      />
                      <label htmlFor="call_checkbox" className="text-blue-900 font-medium select-none mb-0">
                        Call
                      </label>
                      <input type="hidden" name="send_mail_type[]" id="send_mail_type4" value="Call" />
                    </div>

                    {callCheckBoxChecked && !callCheckBoxDisabled && (
                      <div className="mt-3">
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-gray-700"
                          onChange={handleCallOptionChange}
                        >
                          <option value="">Select an Option</option>
                          {filteredCallOptions.map((callOptValueData) => (
                            <option
                              key={callOptValueData.id}
                              value={callOptValueData.id}
                              data-status={`${callOptValueData.status_from}-${callOptValueData.status_to}`}
                            >
                              {callOptValueData.option_val}
                            </option>
                          ))}
                        </select>
                        {selectedCallOption && callSubOptionDisplay && (
                          isCallDiscussionInput ? (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <div className="w-1/6 font-medium">{callDiscussionLabel}</div>
                              <div className="w-2/3">
                                <input
                                  type="text"
                                  name="call_discussion_comments"
                                  id="call_discussion_comments"
                                  className="border p-2 w-full"
                                  value={callDiscussionComments}
                                  onChange={(e) => setCallDiscussionsComments(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                          ) : isCallDateTimeInput ? (
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="w-1/6 font-medium">{callsubOptions[0].split("-")[1]}</div>
                              <div className="w-2/6">
                                <input
                                  type="date"
                                  name="callopt_call_later_date"
                                  id="callopt_call_later_date"
                                  className="border p-2 w-full"
                                  value={callcallLaterDate}
                                  onChange={handleCallDateChange}
                                />
                              </div>
                              <div className="w-2/6">
                                <input
                                  type="time"
                                  name="callopt_call_later_time"
                                  id="callopt_call_later_time"
                                  className="border p-2 w-full"
                                  value={callcallLaterTime}
                                  onChange={handleCallTimeChange}
                                />
                              </div>
                            </div>
                          ) : (
                            !isCallDiscussionInput && !isCallDateTimeInput && (
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {callsubOptions.length > 0 && callsubOptions.map((subOpt, index) => {
                                  const [subOptId, subOptName] = subOpt.split("-");
                                  const callsubSubOptionData = callSubSubOptions[index] || "";
                                  const callsubSubValues = callsubSubOptionData.split("|||");

                                  // Determine input type
                                  let inputType = "text";
                                  if (subOptName === "When to reconnect with the client") {
                                    inputType = "datetime-local";
                                  }

                                  return (
                                    <div key={index} className="flex flex-col gap-2">
                                      <label className="font-medium">{subOptName}:</label>
                                      {callsubSubValues[0].split("-")[1] === "Blank" ? (
                                        <input
                                          type={inputType}
                                          name="call_sub_sub_option_value[]"
                                          className="border p-2 w-full"
                                          value={callSubOptionsValues[index]} // Bind the state value
                                          onChange={(e) => handleCallSubOptionChange(index, e.target.value)}
                                          required
                                        />
                                      ) : (
                                        <select
                                          name="call_sub_sub_option_value[]"
                                          className="border p-2 w-full"
                                          value={callSubOptionsValues[index]} // Bind the state value
                                          onChange={(e) => handleCallSubOptionChange(index, e.target.value)}
                                          required
                                        >
                                          <option value="">Select {subOptName}</option>
                                          {callsubSubValues.length > 0 && callsubSubValues.map((value, i) => {
                                            const [, optionValue] = value.split("-");
                                            return (
                                              <option key={i} value={optionValue}>
                                                {optionValue}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )
                          )
                        )}


                      </div>
                    )}
                  </div>

                </div>


                <div className='flex items-center justify-between '>
                  <button
                    type='button'
                    onClick={() => setCommentsTabVisible(!commentsTabVisible)}
                    className="bg-blue-500 hover:bg-blue-600 text-white my-3 font-medium py-1 px-2 rounded-md shadow-md transition duration-300"
                  >
                    Add Comments
                  </button>

                  <button
                    type='button'
                    onClick={() => handleSubmitButtonClick(queryInfo, queryInfo.arrTags ?? [], remainderDate)}
                    className="bg-orange-500 hover:bg-orange-600 text-white my-3 fssx py-1 px-2 rounded shadow-md transition duration-300"
                  >
                    Submit
                  </button>
                </div>


              </>
            )}
          </div>
        )}

        <HistoryComponent queryInfo={queryInfo} />

      </form>

    </div>
  );
};

export default EmailDiv;