import React, { useState } from 'react';

const EmailDiv = ({ queryInfo, templateInfo }) => {
  const [status, setStatus] = useState(queryInfo.update_status);
  const [remainderDate, setRemainderDate] = useState(queryInfo.remainder_date || '');
  const [showRemainderDiv, setShowRemainderDiv] = useState(queryInfo.update_status === 7);
  const [showEmailCCBCC, setShowEmailCCBCC] = useState(false);
  const [emailBody, setEmailBody] = useState(queryInfo.email_body || '');
  const [subject, setSubject] = useState(queryInfo.subject || '');
  const [attachments, setAttachments] = useState([]);
  const [emailSignature, setEmailSignature] = useState(queryInfo.signature || '');
  const userType = sessionStorage.getItem('user_type');

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setShowRemainderDiv(newStatus === '7');
  };

  const handleEmailCCBCCToggle = (type) => {
    setShowEmailCCBCC(type);
  };

  const handleAttachmentChange = (e) => {
    const files = e.target.files;
    setAttachments([...attachments, ...files]);
  };

  const handleSendEmail = (sendType) => {
    // Logic to send the email
    console.log("Sending email with send type: ", sendType);
  };

  return (
    <div className='px-3 py-2'>
      <form name="viewDetailsForm" id="viewDetailsForm" method="post" style={{ width: '100%' }}>
        <input type="hidden" name="in_time" value={queryInfo.open_date} />
        <input type="hidden" name="assign_id" value={queryInfo.assign_id} />
        <input type="hidden" name="query_id" value={queryInfo.id} />
        <input type="hidden" name="old_status" value={queryInfo.update_status} />

        {userType !== 'Data Manager' && (
          <div className="flex flex-row items-center gap-4">
            {/* Left Side - Label */}
            <div className="w-1/4">
              <label className="text-sm font-medium text-gray-700">Status</label>
            </div>

            {/* Right Side - Select and Additional Elements */}
            <div className="w-3/4 space-y-2">
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
                {queryInfo.commentInfo && queryInfo.commentInfo.length > 0 && (
                  <>
                    <option value="3">Quoted</option>
                    <option value="5">Converted</option>
                    <option value="7">Reminder</option>
                  </>
                )}
                <option value="10">Cross Sell</option>
              </select>

              {/* Reminder Date Input */}
              {showRemainderDiv && (
                <div id="remainder_div" className="mt-2">
                  <input
                    type="text"
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
                <span className="block text-sm text-gray-600">
                  Shifted Date:{" "}
                  {new Date(
                    queryInfo.update_status_date * 1000 // Convert seconds to milliseconds
                  ).toLocaleDateString()}
                </span>
              )}

              {/* Next Followup Date */}
              {queryInfo.followupInfo && queryInfo.followupInfo.followup_day && (
                <div className="text-sm text-gray-600">
                  Next Followup Date:{" "}
                  <span>{new Date(queryInfo.followupInfo.followup_day).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="col-md-12" id="emailCommentsDiv">
          {userType !== 'Data Manager' && queryInfo.email_id && (
            <div className="row">
              <div className="form-group">
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={status == '1' && queryInfo.email_id != ''}
                      disabled={status == '1'}
                      onChange={() => { }}
                    />
                    Email
                    <input type="hidden" name="send_mail_type[]" id="send_mail_type1" value="Email" />
                  </label>
                </div>

                <div id="send_mail_type1Div" style={{ display: status == '1' && queryInfo.email_id != '' ? 'block' : 'none' }}>
                  <div className="btn-group pull-right" style={{ marginTop: '-30px' }}>
                    <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                      <span>{templateInfo && templateInfo.length > 0 ? 'Choose Template' : 'Mail Template'}</span>
                      <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu" role="menu">
                      {templateInfo && templateInfo.length > 0 ? (
                        templateInfo && templateInfo.map((template) => (
                          <li key={template.id}>
                            <a href="javascript:" onClick={() => { }}>
                              {template.template_name}
                            </a>
                          </li>
                        ))
                      ) : (
                        <li className="text-center">Template not found.</li>
                      )}
                    </ul>
                  </div>

                  <div id="TempShow1">
                    <div className="form-group">
                      <label>From:</label>
                      <input type="text" className="form-control" name="mail_from_email" value={queryInfo.website_email} />
                    </div>

                    <div className="form-group">
                      <label>To:</label>
                      <input type="text" className="form-control" name="mail_to" value={queryInfo.email_id} readOnly />
                    </div>

                    <div className="form-group" style={{ display: showEmailCCBCC === 'cc' ? 'block' : 'none' }}>
                      <label>CC:</label>
                      <input type="text" className="form-control" name="email_cc" />
                    </div>

                    <div className="form-group" style={{ display: showEmailCCBCC === 'bcc' ? 'block' : 'none' }}>
                      <label>BCC:</label>
                      <input type="text" className="form-control" name="email_bcc" />
                    </div>

                    <div className="form-group">
                      <label>Subject:</label>
                      <input type="text" className="form-control" name="mail_subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>

                    <label>Email Body:</label>
                    <textarea className="form-control textarea1" name="email_temp_body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />

                    <div className="form-group">
                      <label>Attachment:</label>
                      <input type="file" className="form-control" onChange={handleAttachmentChange} />
                    </div>

                    <div className="form-group">
                      <label>Email Signature:</label>
                      <textarea className="form-control" name="mail_signature" value={emailSignature} onChange={(e) => setEmailSignature(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label>
                        <input type="radio" name="sendType" value="now" checked onChange={() => handleSendEmail('now')} />
                        Send Now
                      </label>
                      <label>
                        <input type="radio" name="sendType" value="later" onChange={() => handleSendEmail('later')} />
                        Send Later
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmailDiv;
