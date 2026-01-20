"use client"

import { useState } from "react";
import GenerateEmployeeRequiredDocuments from "./components/GenerateEmployeeRequiredDocuments";

export default function Home() {

  const [currentContractType, setCurrentContractType] = useState<"5 documents + id picture">("5 documents + id picture");

  const renderContractTypeUI = () => {
    switch (currentContractType) {
      case "5 documents + id picture":
        return <GenerateEmployeeRequiredDocuments />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 mb-5">
          <button onClick={() => setCurrentContractType("5 documents + id picture")} className={`px-3 py-1.5 ${currentContractType === "5 documents + id picture" ? "bg-gray-800" : "bg-gray-600"} text-white rounded text-sm font-medium cursor-pointer`}>
            5 documents + id picture
          </button>
        </div>
        {renderContractTypeUI()}
      </div>
    </div>
  );
}