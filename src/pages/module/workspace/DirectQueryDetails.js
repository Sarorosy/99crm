import React, { useEffect, useState } from "react";

const DirectQueryDetails = ({ assignId }) => {
    const [queryDetails, setQueryDetails] = useState(null);

    useEffect(() => {
        if (assignId && assignId !== '' && assignId !== 'undefined' && assignId !== 'null') {
            fetchQueryDetails(assignId);
        }
    }, [assignId]);

    const fetchQueryDetails = async (id) => {
        try {
            const response = await fetch(`https://99crm.phdconsulting.in/zend/api/get-direct-querydetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });

            const data = await response.json();
            if (data.status) {
                            setQueryDetails(data.query ? data.query.query_details || '' : '');

            }
        } catch (error) {
            console.error("Failed to fetch query details:", error);
        }
    };

    return (
        <div className="p-4">
            {queryDetails ? (
                <div dangerouslySetInnerHTML={{ __html: queryDetails }} />
            ) : (
                <p>Loading or no details available.</p>
            )}
        </div>
    );
};

export default DirectQueryDetails;
