// Dashboard.js

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import $ from "jquery";
import axios from "axios";
import "daterangepicker/daterangepicker.css"; // Import daterangepicker CSS
import "daterangepicker"; // Import daterangepicker JS
import moment from "moment";
import { FilterIcon, Search, RefreshCcw } from "lucide-react";

import { getSocket } from "../../../Socket";
import Last2Hrs from "./Last2Hrs";
import Last12Hrs from "./Last12Hrs";
import Last24Hrs from "./Last24Hrs";
import Last2Days from "./Last2Days";
import Last7Days from "./Last7Days";
import Above7Days from "./Above7Days";

const OpenQuery = () => {
  const socket = getSocket();

  const [keywords, setKeywords] = useState("");

  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [last2Hrs, setLast2Hrs] = useState([]);
  const [last12Hrs, setLast12Hrs] = useState([]);
  const [last24Hrs, setLast24Hrs] = useState([]);
  const [last2Days, setLast2Days] = useState([]);
  const [last7Days, setLast7Days] = useState([]);
  const [above7Days, setAbove7Days] = useState([]);

  const fetchOpenQueries = async () => {
    try {
      setLoading(true);
      const payload = {
        user_id: sessionStorage.getItem("id"),
        user_type: sessionStorage.getItem("user_type"),
        ref_id: refId,
        search_keywords: keywords,
      };

      const response = await axios.post(
        "https://99crm.phdconsulting.in/zend/api/openqueries",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch dashboard data");
      }

      const {
        last2Hrs,
        last12Hrs,
        last24Hrs,
        last2Days,
        last7Days,
        above7Days,
      } = response.data;

      setLast2Hrs(last2Hrs || []);
      setLast12Hrs(last12Hrs || []);
      setLast24Hrs(last24Hrs || []);
      setLast2Days(last2Days || []);
      setLast7Days(last7Days || []);
      setAbove7Days(above7Days || []);
    } catch (error) {
      console.error("Error fetching open query data:", error);
      toast.error(error.message || "Error fetching open query data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOpenQueriesForSocket = async () => {
    try {
      const payload = {
        user_id: sessionStorage.getItem("id"),
        user_type: sessionStorage.getItem("user_type"),

        ref_id: "",
        search_keywords: "",
      };

      const response = await axios.post(
        "https://99crm.phdconsulting.in/zend/api/openqueries",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch dashboard data");
      }

      const {
        last2Hrs,
        last12Hrs,
        last24Hrs,
        last2Days,
        last7Days,
        above7Days,
      } = response.data;

      setLast2Hrs(last2Hrs || []);
      setLast12Hrs(last12Hrs || []);
      setLast24Hrs(last24Hrs || []);
      setLast2Days(last2Days || []);
      setLast7Days(last7Days || []);
      setAbove7Days(above7Days || []);
    } catch (error) {
      console.error("Error fetching open query data:", error);
      toast.error(error.message || "Error fetching open query data");
    } finally {
      setLoading(false);
    }
  };
  ////////////////////////////////////////////////////////////
  useEffect(() => {
    socket.on("new_query_emit", (data) => {
      console.log("Socket data received:", data);
      if (
        sessionStorage.getItem("user_type") == "admin" ||
        sessionStorage.getItem("user_type") == "Data Manager" ||
        sessionStorage.getItem("user_type") == "sub-admin"
      ) {
        fetchOpenQueriesForSocket();
      } else if (
        sessionStorage.getItem("user_type") == "user" &&
        data.user_id == sessionStorage.getItem("id")
      ) {
        fetchOpenQueriesForSocket();
      }
    });

    return () => {
      socket.off("new_query_emit"); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    const handleSocketDataa = async (data) => {
      console.log("Socket data received for open queries:", data);

      const sessionUserId = sessionStorage.getItem("id");
      const userType = sessionStorage.getItem("user_type");

      if (
        sessionUserId == data.user_id ||
        userType === "admin" ||
        userType === "Data Manager" ||
        userType === "sub-admin"
      ) {
        await fetchOpenQueriesForSocket(); // Await the async function
      }
    };

    socket.on("query_status_updated_emit", handleSocketDataa);

    return () => {
      socket.off("query_status_updated_emit", handleSocketDataa); // Clean up properly
    };
  }, []);

  ////////////////////////////////////////////////////////////

  useEffect(() => {
    fetchOpenQueries();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setRefId("");
      setKeywords("");
      const payload = {
        user_id: sessionStorage.getItem("id"),
        user_type: sessionStorage.getItem("user_type"),
        ref_id: "",
        search_keywords: "",
      };

      const response = await axios.post(
        "https://99crm.phdconsulting.in/zend/api/openqueries",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch dashboard data");
      }

      const {
        last2Hrs,
        last12Hrs,
        last24Hrs,
        last2Days,
        last7Days,
        above7Days,
      } = response.data;

      setLast2Hrs(last2Hrs || []);
      setLast12Hrs(last12Hrs || []);
      setLast24Hrs(last24Hrs || []);
      setLast2Days(last2Days || []);
      setLast7Days(last7Days || []);
      setAbove7Days(above7Days || []);
    } catch (error) {
      console.error("Error fetching open query data:", error);
      toast.error(error.message || "Error fetching open query data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-1">
      {/* Filter Section */}
      <div className="bg-gray-50 rounded-lg px-2 py-2 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold ml-2 my-1 text-xl mt-0 flex items-center">
            <span onClick={fetchOpenQueriesForSocket}> Open </span>
            <button
              className="bg-[#cfe1e5] text-[#02313a] rounded px-2 py-1 ml-3"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FilterIcon size={14} className="" />
            </button>
            <button
              className="bg-[#cfe1e5] text-[#02313a] rounded px-2 py-1 ml-2"
              onClick={handleRefresh}
              title="Refresh Queries"
            >
              <RefreshCcw size={14} />
            </button>
          </h2>
        </div>

        <form
          className="dashboardinput"
          style={{ display: showFilter ? "block" : "none" }}
        >
          {/* Flex container for form fields */}
          <div className="flex gap-2">
            {/* Ref ID */}
            <div className="spwdashboardinput">
              <input
                type="text"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                placeholder="Enter Ref ID"
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
              />
            </div>

            {/* Keywords */}
            <div className="flex-1  col-span-1 col-md-3">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords"
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 "
              />
            </div>
          </div>
          <div className="col-md-12 spdbut">
            <button
              type="button"
              onClick={fetchOpenQueries}
              className="btn btn-primary text-white rounded-md  flex items-center py-1 px-2 "
            >
              <Search size={14} className="mr-2" /> Search
            </button>
          </div>
          {/* Search Button */}
        </form>
      </div>

      <div className=" px-2 row items-start justify-between">
        <Last2Hrs
          queries={last2Hrs}
          loading={loading}
          fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket}
        />
        <Last12Hrs
          queries={last12Hrs}
          loading={loading}
          fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket}
        />
        <Last24Hrs
          queries={last24Hrs}
          loading={loading}
          fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket}
        />
        <Last2Days
          queries={last2Days}
          loading={loading}
          fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket}
        />
        <Last7Days
          queries={last7Days}
          loading={loading}
          fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket}
        />
        <Above7Days
          queries={above7Days}
          loading={loading}
          fetchDashboardQueriesForSocket={fetchOpenQueriesForSocket}
        />
      </div>
    </div>
  );
};

export default OpenQuery;
