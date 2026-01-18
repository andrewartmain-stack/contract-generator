"use client"

import { useState } from 'react';

interface Employee {
    id: number;
    name: string;
    position: string;
    terminationDate: string;
    documentDate: string;
}

interface CompanyInfo {
    name: string;
    directorName: string;
}

const CerereIncetareCIMGenerator = () => {

    const [company, setCompany] = useState<CompanyInfo>({
        name: '',
        directorName: 'Director',
    });

    const [employees, setEmployees] = useState<Employee[]>([
        {
            id: 1,
            name: '',
            position: 'CURIER',
            terminationDate: '',
            documentDate: new Date().toISOString().split('T')[0],
        }
    ]);

    const [activeTab, setActiveTab] = useState<'company' | 'employees'>('company');
    const [loading, setLoading] = useState(false);

    const addEmployee = () => {
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        setEmployees([...employees, {
            id: newId,
            name: '',
            position: 'CURIER',
            terminationDate: '',
            documentDate: new Date().toISOString().split('T')[0],
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
            return `${day}.${month}.${year}`;
        } catch (error) {
            console.error('Error formatting date:', dateStr, error);
            return dateStr;
        }
    };

    const handleGenerate = async () => {
        if (!company.name) {
            alert('Vă rugăm să completați numele companiei');
            return;
        }

        const validEmployees = employees.filter(emp =>
            emp.name.trim() &&
            emp.terminationDate.trim() &&
            emp.documentDate.trim()
        );

        if (validEmployees.length === 0) {
            alert('Vă rugăm să adăugați cel puțin un angajat cu nume, data încetării și data documentului');
            return;
        }

        setLoading(true);

        try {
            for (const employee of validEmployees) {
                const cerereData = {
                    // Employee information
                    employee_name: employee.name,
                    employee_position: employee.position,

                    // Company information
                    company_name: company.name,

                    // Termination information
                    termination_date: formatDate(employee.terminationDate),

                    // Document date
                    document_date: formatDate(employee.documentDate),

                    // Director name
                    director_name: company.directorName,
                };

                await generateSingleCerere(cerereData);

                if (validEmployees.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Eroare la generarea cererilor de încetare contract');
        } finally {
            setLoading(false);
        }
    };

    const generateSingleCerere = async (data: any) => {
        try {
            const response = await fetch('/api/generate-cerere-incetare', {
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
            link.download = `Cerere_Incetare_CIM_${data.employee_name.replace(/\s+/g, '_')}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating cerere incetare:', error);
            throw error;
        }
    };

    return (
        <>
            <header className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Generator Cereri Încetare CIM</h1>
                        <p className="text-gray-600 text-sm">Generați cereri de încetare a contractului de muncă (art. 55 lit. b)</p>
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
                                            placeholder="Ex: SC EXEMPLU SRL"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Numele companiei care va apărea în cerere (fără "SC" și "SRL")
                                        </p>
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
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data încetării contractului *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.terminationDate}
                                                        onChange={(e) => updateEmployee(employee.id, 'terminationDate', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Data de la care se solicită încetarea contractului
                                                    </p>
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
                                                        Data la care se completează cererea
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
                                    Generează cereri încetare
                                </>
                            )}
                        </button>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Detalii șablon</h4>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>Șablon: <code className="bg-gray-100 px-1.5 py-0.5 rounded">cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx</code></p>
                                <p>Câmpurile marcate cu * sunt obligatorii</p>
                                <p>Fiecare angajat primește cerere separată</p>
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

export default CerereIncetareCIMGenerator