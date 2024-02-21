import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EstimationModel from "./EstimationModel";
import axios from "axios";
import "./Main.css";
import { Box, Button, Textarea } from "@chakra-ui/react";
import { API_URL } from "../config";
const sampleData = require("../respExample.json");
const sampleEstimation = require("../respEstimationExample.json");
// import dotenv from 'dotenv';
// dotenv.config();

function Main({ onUpload, fileHandle, file }) {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [estimation, setEstimation] = useState(500); // Example estimation value
  const [isLoading, setLoading] = useState(false);

  const [codelines, setCodeLines] = useState("");

  let handleInputChange = (e) => {
    setCodeLines(e.target.value);
  };

  // let hasAccpeted = null;
  const handleAccept = async () => {
    setLoading(true);
    setModalOpen(false);
    try {
      const response = await fetch(`${API_URL}/audit-contract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-confirmed": true,
        },
        body: JSON.stringify({ contract: codelines }), // Sending the estimation value
      });

      if (!response.ok) {
        console.log("error while fetching the audit of th contract");
        throw new Error("Network response was not ok");
      }

      const resp = await response.json();

      const responseData = resp;

      console.log(responseData);
      if (responseData.msg === "Success") {
        // Check if the success flag is true in the response
        onUpload(responseData.result);
        navigate("/analysis"); // Redirect to the analysis page
      } else {
        // console.error(responseData.message);
        console.error("error resposne data ");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }

    setLoading(false);
  };

  const handleReject = () => {
    console.log("Estimation Rejected");
    setModalOpen(false);
  };

  const handleFile = async () => {
    try {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/audit-contract`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cost_only: true,
          },
          body: JSON.stringify({ contract: codelines }),
        });
        console.log("resp ", response);
        if (!response.ok) {
          console.log("error while fetch ");
          return;
        }
        const resp = await response.json();
        console.log("final resp ", resp);

        const costEstimation = resp;

        if (costEstimation.msg === "Success") {
          setEstimation(costEstimation.result.estimationCost);
          setModalOpen(true);
        } else {
          alert("Error while fetching cost estimation");
          return;
        }
      } catch (err) {
        console.log("error fetch ", err);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to analyze the contract:", error);
    }
  };

  return (
    <div className="main-container">
      <h2>AI Smart Contract Auditor</h2>
      {isLoading ? (
        <div className="loading-wrapper">
          <div className="loading-main">Loading...</div>
        </div>
      ) : (
        <Textarea
          placeholder="Enter your smart contract code"
          size={"sm"}
          onChange={handleInputChange}
          value={codelines}
          minHeight={500}
        />
      )}

      <Button
        colorScheme="blue"
        onClick={handleFile}
        disabled={codelines.length === 0 || isLoading}
        mt={2}
      >
        Submit
      </Button>

      {isModalOpen && (
        <EstimationModel
          estimation={estimation}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default Main;
