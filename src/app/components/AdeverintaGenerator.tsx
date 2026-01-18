"use client"

import { useState } from 'react';

interface Employee {
    id: number;
    name: string;
    country: string;
    birthDate: string;
    passportSeries: string;
    passportNumber: string;
    passportIssuedBy: string;
    workPermit: string;
    workPermitDate: string;
    serviceAddress: string;
    documentDate: string; // Добавляем поле даты документа для каждого сотрудника
}

interface CompanyInfo {
    name: string;
    city: string;
    sector: string;
    street: string;
    number: string;
    registrationNumber: string;
    fiscalCode: string;
    representativeGender: string;
    representativeName: string;
    representativeTitle: string;
}

const AdeverintaGenerator = () => {

    const [company, setCompany] = useState<CompanyInfo>({
        name: '',
        city: '',
        sector: '',
        street: '',
        number: '',
        registrationNumber: '',
        fiscalCode: '',
        representativeGender: '',
        representativeName: '',
        representativeTitle: '',
    });

    const [employees, setEmployees] = useState<Employee[]>([
        {
            id: 1,
            name: '',
            country: '',
            birthDate: '',
            passportSeries: '',
            passportNumber: '',
            passportIssuedBy: '',
            workPermit: '',
            workPermitDate: '',
            serviceAddress: '',
            documentDate: new Date().toISOString().split('T')[0], // Текущая дата по умолчанию
        }
    ]);

    const [activeTab, setActiveTab] = useState<'company' | 'employees'>('company');
    const [loading, setLoading] = useState(false);

    const addEmployee = () => {
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        setEmployees([...employees, {
            id: newId,
            name: '',
            country: '',
            birthDate: '',
            passportSeries: '',
            passportNumber: '',
            passportIssuedBy: '',
            workPermit: '',
            workPermitDate: '',
            serviceAddress: '',
            documentDate: new Date().toISOString().split('T')[0], // Текущая дата по умолчанию
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

        if (!company.representativeName) {
            alert('Vă rugăm să completați numele reprezentantului');
            return;
        }

        const validEmployees = employees.filter(emp =>
            emp.name.trim() && emp.country.trim() && emp.documentDate.trim()
        );

        if (validEmployees.length === 0) {
            alert('Vă rugăm să adăugați cel puțin un angajat cu nume, țară și dată document');
            return;
        }

        setLoading(true);

        try {
            for (const employee of validEmployees) {
                const adeverintaData = {
                    // Company information
                    company_name: company.name,
                    company_city: company.city,
                    company_sector: company.sector,
                    company_street: company.street,
                    company_number: company.number,
                    company_registration_number: company.registrationNumber,
                    company_fiscal_code: company.fiscalCode,
                    representative_gender: company.representativeGender,
                    company_representative: company.representativeName,
                    company_representative_title: company.representativeTitle,

                    // Employee information
                    employee_name: employee.name,
                    employee_country: employee.country,
                    employee_birth_date: formatDate(employee.birthDate),
                    employee_passport_series: employee.passportSeries,
                    employee_passport_number: employee.passportNumber,
                    employee_passport_issued_by: employee.passportIssuedBy,
                    employee_work_permit: employee.workPermit,
                    employee_work_permit_date: formatDate(employee.workPermitDate),
                    employee_service_address: employee.serviceAddress,

                    // Document date - индивидуально для каждого сотрудника
                    document_date: formatDate(employee.documentDate),
                };

                await generateSingleAdeverinta(adeverintaData);

                if (validEmployees.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Eroare la generarea adeverințelor');
        } finally {
            setLoading(false);
        }
    };

    const generateSingleAdeverinta = async (data: any) => {
        try {
            const response = await fetch('/api/generate-adeverinta', {
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
            link.download = `Adeverinta_${data.employee_name.replace(/\s+/g, '_')}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating adeverinta:', error);
            throw error;
        }
    };

    return (
        <>
            <header className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Generator Adeverințe</h1>
                        <p className="text-gray-600 text-sm">Generați adeverințe pentru angajați</p>
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
                                                placeholder="Numele companiei"
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
                                                Număr Înregistrare
                                            </label>
                                            <input
                                                type="text"
                                                value={company.registrationNumber}
                                                onChange={(e) => updateCompany('registrationNumber', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                placeholder="J40/1234/2023"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Reprezentant Legal *
                                            </label>
                                            <input
                                                type="text"
                                                value={company.representativeName}
                                                onChange={(e) => updateCompany('representativeName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                placeholder="Nume reprezentant"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Funcția Reprezentantului
                                            </label>
                                            <input
                                                type="text"
                                                value={company.representativeTitle}
                                                onChange={(e) => updateCompany('representativeTitle', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                placeholder="Ex: Director General"
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

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Număr
                                                </label>
                                                <input
                                                    type="text"
                                                    value={company.number}
                                                    onChange={(e) => updateCompany('number', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    placeholder="123"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Sector
                                                </label>
                                                <input
                                                    type="text"
                                                    value={company.sector}
                                                    onChange={(e) => updateCompany('sector', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    placeholder="Ex: 1"
                                                />
                                            </div>
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Gen Reprezentant
                                            </label>
                                            <select
                                                value={company.representativeGender}
                                                onChange={(e) => updateCompany('representativeGender', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                            >
                                                <option value="">Selectează</option>
                                                <option value="Domnul">Domnul</option>
                                                <option value="Doamna">Doamna</option>
                                            </select>
                                        </div>
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
                                                        Țara de cetățenie *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.country}
                                                        onChange={(e) => updateEmployee(employee.id, 'country', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Ex: România"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data nașterii
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.birthDate}
                                                        onChange={(e) => updateEmployee(employee.id, 'birthDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Seria pașaport
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={employee.passportSeries}
                                                            onChange={(e) => updateEmployee(employee.id, 'passportSeries', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                            placeholder="Ex: A123"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Număr pașaport
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={employee.passportNumber}
                                                            onChange={(e) => updateEmployee(employee.id, 'passportNumber', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                            placeholder="Ex: 123456"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Pașaport eliberat de
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.passportIssuedBy}
                                                        onChange={(e) => updateEmployee(employee.id, 'passportIssuedBy', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Ex: Ministerul Afacerilor Interne"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Aviz de muncă
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.workPermit}
                                                        onChange={(e) => updateEmployee(employee.id, 'workPermit', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Numărul avizului"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data aviz muncă
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.workPermitDate}
                                                        onChange={(e) => updateEmployee(employee.id, 'workPermitDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Locuință de serviciu
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.serviceAddress}
                                                        onChange={(e) => updateEmployee(employee.id, 'serviceAddress', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Adresa locuinței de serviciu"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data documentului *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.documentDate}
                                                        onChange={(e) => updateEmployee(employee.id, 'documentDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Data care va apărea pe adeverința acestui angajat.
                                                    </p>
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
                                    Generează adeverințe
                                </>
                            )}
                        </button>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Detalii șablon</h4>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>Șablon: <code className="bg-gray-100 px-1.5 py-0.5 rounded">adeverinta_WITH_PLACEHOLDERS.docx</code></p>
                                <p>Câmpurile marcate cu * sunt obligatorii</p>
                                <p>Data documentului este individuală pentru fiecare angajat</p>
                                <p>Formular legal românesc</p>
                                <p>Format dată: zi.lună.an</p>
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
        </>
    )
}

export default AdeverintaGenerator