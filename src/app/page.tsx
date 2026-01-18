"use client"

import { useState } from "react";
import CIMGenerator from "./components/CIMGenerator";
import AdeverintaGenerator from "./components/AdeverintaGenerator";
import CerereConcediuDeOdihnaGenerator from "./components/CerereConcediuDeOdihnaGenerator";
import CerereIncetareCIMGenerator from "./components/CerereIncetareCIMGenerator";
import FisaDePostGenerator from "./components/FisaDePostGenerator";

export default function Home() {

  const [currentContractType, setCurrentContractType] = useState<"cim" | "adeverinta" | "cerere concediu de odihna" | "cerere incetare cim" | "fisa de post">("cim");

  const renderContractTypeUI = () => {
    switch (currentContractType) {
      case "cim":
        return <CIMGenerator />
      case "adeverinta":
        return <AdeverintaGenerator />
      case "cerere concediu de odihna":
        return <CerereConcediuDeOdihnaGenerator />
      case "cerere incetare cim":
        return <CerereIncetareCIMGenerator />
      case "fisa de post":
        return <FisaDePostGenerator />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 mb-5">
          <button onClick={() => setCurrentContractType("cim")} className={`px-3 py-1.5 ${currentContractType === "cim" ? "bg-gray-800" : "bg-gray-600"} text-white rounded text-sm font-medium cursor-pointer`}>
            CIM
          </button>
          <button onClick={() => setCurrentContractType("adeverinta")} className={`px-3 py-1.5 ${currentContractType === "adeverinta" ? "bg-gray-800" : "bg-gray-600"} text-white rounded text-sm font-medium cursor-pointer`}>
            Adeverinta
          </button>
          <button onClick={() => setCurrentContractType("cerere concediu de odihna")} className={`px-3 py-1.5 ${currentContractType === "cerere concediu de odihna" ? "bg-gray-800" : "bg-gray-600"} text-white rounded text-sm font-medium cursor-pointer`}>
            Cerere Concediu De Odihna
          </button>
          <button onClick={() => setCurrentContractType("cerere incetare cim")} className={`px-3 py-1.5 ${currentContractType === "cerere incetare cim" ? "bg-gray-800" : "bg-gray-600"} text-white rounded text-sm font-medium cursor-pointer`}>
            Cerere Incetare CIM
          </button>
          <button onClick={() => setCurrentContractType("fisa de post")} className={`px-3 py-1.5 ${currentContractType === "fisa de post" ? "bg-gray-800" : "bg-gray-600"} text-white rounded text-sm font-medium cursor-pointer`}>
            Fisa De Post
          </button>
        </div>
        {renderContractTypeUI()}
      </div>
    </div>
  );
}