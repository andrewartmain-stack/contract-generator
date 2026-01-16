'use client';

import { useState } from 'react';

interface Employee {
  id: number;
  name: string;
  cnp: string;
  city: string;
  street: string;
  number: string;
  building: string;
  apartment: string;
  county: string;
  residencePermit: string;
  residenceIssuedBy: string;
  residenceIssuedDate: string;
  passport?: string;
  birthDate?: string;
  country?: string;
}

interface CompanyInfo {
  name: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  county: string;
  fiscalCode: string;
  representative: string;
}

interface ContractDates {
  contractNumber: string;
  contractRegistrationDate: string;
  startDate: string;
}

interface ContractDetails {
  probationConditions: string;
  workplace: string;
  workplaceAlternative: string;
  workplaceArea: string;
  workplaceBenefits: string;
  workplaceSupplements: string;
  workplaceTransport: string;
  shiftSchedule: string;
  vacationDays: string;
  salaryAllowances: string;
  salarySupplementsCash: string;
  salarySupplementsKind: string;
  salaryOtherAdditions: string;
  overtimeRate: string;
  paymentDate: string;
  paymentMethod: string;
  dismissalNotice: string;
  resignationNotice: string;
  otherClauses: string;
  digitalSignatureUsage: string;
  professionalTraining: string;
  personalProtectiveEquipment: string;
  workEquipment: string;
  hygieneMaterials: string;
  protectiveNutrition: string;
  otherHealthSafety: string;
  collectiveAgreementLevel: string;
}

export default function Home() {
  const [company, setCompany] = useState<CompanyInfo>({
    name: '',
    city: '',
    street: '',
    building: '',
    apartment: '',
    county: '',
    fiscalCode: '',
    representative: '',
  });

  const [dates, setDates] = useState<ContractDates>({
    contractNumber: '',
    contractRegistrationDate: '',
    startDate: ''
  });

  const [details, setDetails] = useState<ContractDetails>({
    probationConditions: '',
    workplace: '',
    workplaceAlternative: '',
    workplaceArea: '',
    workplaceBenefits: '',
    workplaceSupplements: '',
    workplaceTransport: '',
    shiftSchedule: '',
    vacationDays: '',
    salaryAllowances: '',
    salarySupplementsCash: '',
    salarySupplementsKind: '',
    salaryOtherAdditions: '',
    overtimeRate: '',
    paymentDate: '',
    paymentMethod: '',
    dismissalNotice: '',
    resignationNotice: '',
    otherClauses: '',
    digitalSignatureUsage: '',
    professionalTraining: '',
    personalProtectiveEquipment: '',
    workEquipment: '',
    hygieneMaterials: '',
    protectiveNutrition: '',
    otherHealthSafety: '',
    collectiveAgreementLevel: ''
  });

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: '',
      cnp: '',
      city: '',
      street: '',
      number: '',
      building: '',
      apartment: '',
      county: '',
      residencePermit: '',
      residenceIssuedBy: '',
      residenceIssuedDate: '',
      passport: '',
      birthDate: '',
      country: ''
    }
  ]);

  const [activeTab, setActiveTab] = useState<'company' | 'contract' | 'employees'>('company');
  const [loading, setLoading] = useState(false);

  const addEmployee = () => {
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees([...employees, {
      id: newId,
      name: '',
      cnp: '',
      city: '',
      street: '',
      number: '',
      building: '',
      apartment: '',
      county: '',
      residencePermit: '',
      residenceIssuedBy: '',
      residenceIssuedDate: '',
      passport: '',
      birthDate: '',
      country: ''
    }]);
  };

  const removeEmployee = (id: number) => {
    if (employees.length > 1) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const updateEmployee = (id: number, field: keyof Employee, value: string) => {
    setEmployees(employees.map(emp =>
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const updateCompany = (field: keyof CompanyInfo, value: string) => {
    setCompany({ ...company, [field]: value });
  };

  const updateDate = (field: keyof ContractDates, value: string) => {
    setDates({ ...dates, [field]: value });
  };

  const updateDetails = (field: keyof ContractDetails, value: string) => {
    setDetails({ ...details, [field]: value });
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return dateStr;
    }
  };

  const handleGenerate = async () => {
    if (!company.name || !company.fiscalCode) {
      alert('Vă rugăm să completați informațiile companiei');
      return;
    }

    if (!dates.startDate) {
      alert('Vă rugăm să completați data de începere a contractului');
      return;
    }

    const validEmployees = employees.filter(emp =>
      emp.name.trim() && emp.cnp.trim()
    );

    if (validEmployees.length === 0) {
      alert('Vă rugăm să adăugați cel puțin un angajat cu nume și CNP');
      return;
    }

    setLoading(true);

    try {
      for (const employee of validEmployees) {
        const contractData = {
          company_name: company.name,
          company_city: company.city,
          company_street: company.street,
          company_building: company.building,
          company_apartment: company.apartment,
          company_county: company.county,
          company_fiscal_code: company.fiscalCode,
          company_representative: company.representative,

          employee_name: employee.name,
          employee_cnp: employee.cnp,
          employee_city: employee.city,
          employee_street: employee.street,
          employee_number: employee.number,
          employee_building: employee.building,
          employee_apartment: employee.apartment,
          employee_county: employee.county,
          employee_residence_permit: employee.residencePermit,
          employee_residence_issued_by: employee.residenceIssuedBy,
          employee_residence_issued_date: formatDate(employee.residenceIssuedDate),
          employee_passport: employee.passport || '',
          employee_country: employee.country || '',
          employee_birth_date: formatDate(employee.birthDate || ''),

          contract_number: dates.contractNumber,
          contract_registration_date: formatDate(dates.contractRegistrationDate),
          contract_start_date: formatDate(dates.startDate),

          probation_conditions: details.probationConditions,
          workplace: details.workplace,
          workplace_alternative: details.workplaceAlternative,
          workplace_area: details.workplaceArea,
          workplace_benefits: details.workplaceBenefits,
          workplace_supplements: details.workplaceSupplements,
          workplace_transport: details.workplaceTransport,
          shift_schedule: details.shiftSchedule,
          vacation_days: details.vacationDays,
          salary_allowances: details.salaryAllowances,
          salary_supplements_cash: details.salarySupplementsCash,
          salary_supplements_kind: details.salarySupplementsKind,
          salary_other_additions: details.salaryOtherAdditions,
          overtime_rate: details.overtimeRate,
          payment_date: details.paymentDate,
          payment_method: details.paymentMethod,
          dismissal_notice: details.dismissalNotice,
          resignation_notice: details.resignationNotice,
          other_clauses: details.otherClauses,
          digital_signature_usage: details.digitalSignatureUsage,
          professional_training: details.professionalTraining,
          personal_protective_equipment: details.personalProtectiveEquipment,
          work_equipment: details.workEquipment,
          hygiene_materials: details.hygieneMaterials,
          protective_nutrition: details.protectiveNutrition,
          other_health_safety: details.otherHealthSafety,
          collective_agreement_level: details.collectiveAgreementLevel,

          job_position: 'CURIER',
          job_cor_code: '962101',
          base_salary: '4050',
          probation_period: '90',
          work_schedule_type: 'Inegal',
          working_conditions: 'normale'
        };

        await generateSingleContract(contractData);

        if (validEmployees.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Eroare la generarea contractelor');
    } finally {
      setLoading(false);
    }
  };

  const generateSingleContract = async (data: any) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contract_${data.employee_name.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating contract:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Generator Contract Muncă CIM</h1>
              <p className="text-gray-600 text-sm">Generați contracte individuale de muncă</p>
            </div>
            <div className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm">
              <span className="font-medium">CIM Românesc</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-300">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('company')}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'company'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Companie
                </span>
              </button>
              <button
                onClick={() => setActiveTab('contract')}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'contract'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Contract
                </span>
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'employees'
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  </svg>
                  Angajați ({employees.length})
                </span>
              </button>
            </nav>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Company Details Tab */}
            {activeTab === 'company' && (
              <div className="bg-white rounded border border-gray-300 p-4">
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Informații Companie</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nume Companie *
                        </label>
                        <input
                          type="text"
                          value={company.name}
                          onChange={(e) => updateCompany('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Persoana juridica"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cod Fiscal (CIF) *
                        </label>
                        <input
                          type="text"
                          value={company.fiscalCode}
                          onChange={(e) => updateCompany('fiscalCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="RO12345678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reprezentant Legal
                        </label>
                        <input
                          type="text"
                          value={company.representative}
                          onChange={(e) => updateCompany('representative', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Nume reprezentant"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stradă
                        </label>
                        <input
                          type="text"
                          value={company.street}
                          onChange={(e) => updateCompany('street', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Str. Exemplu"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nr.
                          </label>
                          <input
                            type="text"
                            value={company.building}
                            onChange={(e) => updateCompany('building', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="1A"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ap.
                          </label>
                          <input
                            type="text"
                            value={company.apartment}
                            onChange={(e) => updateCompany('apartment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Localitate
                          </label>
                          <input
                            type="text"
                            value={company.city}
                            onChange={(e) => updateCompany('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="București"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Județ
                        </label>
                        <input
                          type="text"
                          value={company.county}
                          onChange={(e) => updateCompany('county', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="București"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contract Terms Tab */}
            {activeTab === 'contract' && (
              <div className="bg-white rounded border border-gray-300 p-4">
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Detalii Contract</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Număr Contract
                      </label>
                      <input
                        type="text"
                        value={dates.contractNumber}
                        onChange={(e) => updateDate('contractNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                        placeholder="Ex: 123/2024"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Înregistrare
                      </label>
                      <input
                        type="date"
                        value={dates.contractRegistrationDate}
                        onChange={(e) => updateDate('contractRegistrationDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Începere *
                      </label>
                      <input
                        type="date"
                        value={dates.startDate}
                        onChange={(e) => updateDate('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Perioada de probă</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condiții perioadă de probă
                      </label>
                      <input
                        type="text"
                        value={details.probationConditions}
                        onChange={(e) => updateDetails('probationConditions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                        placeholder="Ex: evaluare la 45 zile"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Locul de Muncă</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Punct de lucru principal
                        </label>
                        <input
                          type="text"
                          value={details.workplace}
                          onChange={(e) => updateDetails('workplace', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: sediul central"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loc de muncă alternativ
                          </label>
                          <input
                            type="text"
                            value={details.workplaceAlternative}
                            onChange={(e) => updateDetails('workplaceAlternative', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: pe teren"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arie geografică
                          </label>
                          <input
                            type="text"
                            value={details.workplaceArea}
                            onChange={(e) => updateDetails('workplaceArea', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: municipiul București"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beneficii loc de muncă
                        </label>
                        <input
                          type="text"
                          value={details.workplaceBenefits}
                          onChange={(e) => updateDetails('workplaceBenefits', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: decontare transport"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Program și Concedii</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Program schimburi
                        </label>
                        <input
                          type="text"
                          value={details.shiftSchedule}
                          onChange={(e) => updateDetails('shiftSchedule', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: 3 schimburi"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zile concediu suplimentar
                        </label>
                        <input
                          type="text"
                          value={details.vacationDays}
                          onChange={(e) => updateDetails('vacationDays', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: 3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Salariu și Plăți</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sporuri/Indemnizații
                        </label>
                        <input
                          type="text"
                          value={details.salaryAllowances}
                          onChange={(e) => updateDetails('salaryAllowances', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: spor vechime 10%"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prestații suplimentare bani
                          </label>
                          <input
                            type="text"
                            value={details.salarySupplementsCash}
                            onChange={(e) => updateDetails('salarySupplementsCash', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: bonus performanță"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prestații suplimentare natură
                          </label>
                          <input
                            type="text"
                            value={details.salarySupplementsKind}
                            onChange={(e) => updateDetails('salarySupplementsKind', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: masa de prânz"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Spor ore suplimentare (%)
                          </label>
                          <input
                            type="text"
                            value={details.overtimeRate}
                            onChange={(e) => updateDetails('overtimeRate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: 75"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data plății
                          </label>
                          <input
                            type="text"
                            value={details.paymentDate}
                            onChange={(e) => updateDetails('paymentDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: 25 ale lunii"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Metoda de plată
                          </label>
                          <input
                            type="text"
                            value={details.paymentMethod}
                            onChange={(e) => updateDetails('paymentMethod', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: transfer bancar"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Perioade de preaviz</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preaviz concediere (zile)
                        </label>
                        <input
                          type="text"
                          value={details.dismissalNotice}
                          onChange={(e) => updateDetails('dismissalNotice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: 20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preaviz demisie (zile)
                        </label>
                        <input
                          type="text"
                          value={details.resignationNotice}
                          onChange={(e) => updateDetails('resignationNotice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: 20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Alte clauze</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alte clauze contractuale
                        </label>
                        <textarea
                          value={details.otherClauses}
                          onChange={(e) => updateDetails('otherClauses', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: clauze specifice contractului"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Semnătură electronică
                          </label>
                          <input
                            type="text"
                            value={details.digitalSignatureUsage}
                            onChange={(e) => updateDetails('digitalSignatureUsage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: conform Regulament intern"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Formare profesională
                          </label>
                          <input
                            type="text"
                            value={details.professionalTraining}
                            onChange={(e) => updateDetails('professionalTraining', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: cursuri anuale"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-800 mb-3">Securitate și Sănătate</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Echipament protecție
                          </label>
                          <input
                            type="text"
                            value={details.personalProtectiveEquipment}
                            onChange={(e) => updateDetails('personalProtectiveEquipment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: cască, mănuși"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Echipament de lucru
                          </label>
                          <input
                            type="text"
                            value={details.workEquipment}
                            onChange={(e) => updateDetails('workEquipment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: scule, uniformă"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Materiale igienico-sanitare
                          </label>
                          <input
                            type="text"
                            value={details.hygieneMaterials}
                            onChange={(e) => updateDetails('hygieneMaterials', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: săpun, dezinfectant"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alimentație de protecție
                          </label>
                          <input
                            type="text"
                            value={details.protectiveNutrition}
                            onChange={(e) => updateDetails('protectiveNutrition', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            placeholder="Ex: lapte, fructe"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alte drepturi securitate sănătate
                        </label>
                        <input
                          type="text"
                          value={details.otherHealthSafety}
                          onChange={(e) => updateDetails('otherHealthSafety', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                          placeholder="Ex: examene medicale periodice"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nivel contract colectiv
                      </label>
                      <input
                        type="text"
                        value={details.collectiveAgreementLevel}
                        onChange={(e) => updateDetails('collectiveAgreementLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                        placeholder="Ex: unitate/grup de unități"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employees Tab */}
            {activeTab === 'employees' && (
              <div className="bg-white rounded border border-gray-300 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Lista Angajați</h2>
                  <button
                    onClick={addEmployee}
                    className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adaugă
                  </button>
                </div>

                <div className="space-y-4">
                  {employees.map((employee, index) => (
                    <div key={employee.id} className="border border-gray-200 rounded p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-md font-medium text-gray-800">Angajat #{index + 1}</h3>
                        {employees.length > 1 && (
                          <button
                            onClick={() => removeEmployee(employee.id)}
                            className="px-2 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 transition-colors"
                          >
                            Șterge
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nume complet *
                            </label>
                            <input
                              type="text"
                              value={employee.name}
                              onChange={(e) => updateEmployee(employee.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                              placeholder="Nume Prenume"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CNP *
                            </label>
                            <input
                              type="text"
                              value={employee.cnp}
                              onChange={(e) => updateEmployee(employee.id, 'cnp', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                              placeholder="CNP"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Permis de ședere
                            </label>
                            <input
                              type="text"
                              value={employee.residencePermit}
                              onChange={(e) => updateEmployee(employee.id, 'residencePermit', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                              placeholder="Număr permis"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Emis de
                            </label>
                            <input
                              type="text"
                              value={employee.residenceIssuedBy}
                              onChange={(e) => updateEmployee(employee.id, 'residenceIssuedBy', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                              placeholder="Instituția emitentă"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Data emiterii
                            </label>
                            <input
                              type="date"
                              value={employee.residenceIssuedDate}
                              onChange={(e) => updateEmployee(employee.id, 'residenceIssuedDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stradă
                            </label>
                            <input
                              type="text"
                              value={employee.street}
                              onChange={(e) => updateEmployee(employee.id, 'street', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                              placeholder="Str. Exemplu"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nr.
                              </label>
                              <input
                                type="text"
                                value={employee.number}
                                onChange={(e) => updateEmployee(employee.id, 'number', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                placeholder="1"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bloc
                              </label>
                              <input
                                type="text"
                                value={employee.building}
                                onChange={(e) => updateEmployee(employee.id, 'building', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                placeholder="A1"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Apartament
                            </label>
                            <input
                              type="text"
                              value={employee.apartment}
                              onChange={(e) => updateEmployee(employee.id, 'apartment', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                              placeholder="10"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Localitate
                            </label>
                            <input
                              type="text"
                              value={employee.city}
                              onChange={(e) => updateEmployee(employee.id, 'city', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                              placeholder="București"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Județ
                            </label>
                            <input
                              type="text"
                              value={employee.county}
                              onChange={(e) => updateEmployee(employee.id, 'county', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                              placeholder="București"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions and Info */}
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="bg-white rounded border border-gray-300 p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Rezumat</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Companie</span>
                  <span className="font-medium text-gray-800 truncate max-w-[150px]">
                    {company.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Angajați</span>
                  <span className="font-medium text-gray-800">{employees.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data începere</span>
                  <span className="font-medium text-gray-800">
                    {dates.startDate ? formatDate(dates.startDate) : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Funcție</span>
                  <span className="font-medium text-gray-800">CURIER</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Salariu bază</span>
                  <span className="font-medium text-gray-800">4.050 lei</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Perioadă probă</span>
                  <span className="font-medium text-gray-800">90 zile</span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded border border-gray-300 p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Generare</h3>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Se generează...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generează contracte
                  </>
                )}
              </button>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Detalii șablon</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Șablon: <code className="bg-gray-100 px-1.5 py-0.5 rounded">CIM_DRAFT_WITH_PLACEHOLDERS.docx</code></p>
                  <p>Toate câmpurile sunt opționale</p>
                  <p>Formular legal românesc</p>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white rounded border border-gray-300 p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Navigare</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('company')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${activeTab === 'company'
                    ? 'bg-gray-100 text-gray-800 border border-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Companie
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('contract')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${activeTab === 'contract'
                    ? 'bg-gray-100 text-gray-800 border border-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Contract
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('employees')}
                  className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${activeTab === 'employees'
                    ? 'bg-gray-100 text-gray-800 border border-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    </svg>
                    Angajați ({employees.length})
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}