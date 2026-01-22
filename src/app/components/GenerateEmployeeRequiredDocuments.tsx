"use client"

import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Employee {
    id: number;
    employee_name_worker_field: string;
    employee_address_worker_field: string;
    document_cnp_worker_field: string;
    type_of_document_worker_field: string;
    document_seria_number_worker_field: string;
    document_given_by_worker_field: string;
    document_creation_date_worker_field: string;
    contract_number_worker_field: string;
    starting_date_worker_field: string;
    salary_worker_field: string;
    cor_worker_field: string;
    worker_position_worker_field: string;
    photo_file: File | null;
    photo_base64: string | null;
    photo_preview_url: string | null;
    photo_loading: boolean;
}

interface CompanyInfo {
    company_name_company_field: string;
    company_address_company_field: string;
    company_fiscal_code_company_field: string;
    company_owner_company_field: string;
}

const GenerateEmployeeRequiredDocuments = () => {
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const importFileInputRef = useRef<HTMLInputElement>(null);

    const [company, setCompany] = useState<CompanyInfo>({
        company_name_company_field: '',
        company_address_company_field: '',
        company_fiscal_code_company_field: '',
        company_owner_company_field: '',
    });

    const [employees, setEmployees] = useState<Employee[]>([
        {
            id: 1,
            employee_name_worker_field: '',
            employee_address_worker_field: '',
            document_cnp_worker_field: '',
            type_of_document_worker_field: 'permisului de sedere',
            document_seria_number_worker_field: '',
            document_given_by_worker_field: '',
            document_creation_date_worker_field: '',
            contract_number_worker_field: '',
            starting_date_worker_field: '',
            salary_worker_field: '4050',
            cor_worker_field: 'cor 962101',
            worker_position_worker_field: 'CURIER',
            photo_file: null,
            photo_base64: null,
            photo_preview_url: null,
            photo_loading: false
        }
    ]);

    const [activeTab, setActiveTab] = useState<'company' | 'employees'>('company');
    const [loading, setLoading] = useState(false);
    const [photoProcessing, setPhotoProcessing] = useState<number[]>([]);
    const [importing, setImporting] = useState(false);
    const [importStats, setImportStats] = useState<{
        total: number;
        imported: number;
        failed: number;
    } | null>(null);

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            employees.forEach(emp => {
                if (emp.photo_preview_url) {
                    URL.revokeObjectURL(emp.photo_preview_url);
                }
            });
        };
    }, [employees]);

    const addEmployee = () => {
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        setEmployees([...employees, {
            id: newId,
            employee_name_worker_field: '',
            employee_address_worker_field: '',
            document_cnp_worker_field: '',
            type_of_document_worker_field: 'permisului de sedere',
            document_seria_number_worker_field: '',
            document_given_by_worker_field: '',
            document_creation_date_worker_field: '',
            contract_number_worker_field: '',
            starting_date_worker_field: '',
            salary_worker_field: '4050',
            cor_worker_field: 'cor 962101',
            worker_position_worker_field: 'CURIER',
            photo_file: null,
            photo_base64: null,
            photo_preview_url: null,
            photo_loading: false
        }]);
    };

    const removeEmployee = (id: number) => {
        if (employees.length > 1) {
            // Clean up preview URL if exists
            const employee = employees.find(emp => emp.id === id);
            if (employee?.photo_preview_url) {
                URL.revokeObjectURL(employee.photo_preview_url);
            }

            setEmployees(employees.filter(emp => emp.id !== id));
            // Remove file input ref
            delete fileInputRefs.current[id];
        }
    };

    const updateEmployee = (id: number, field: keyof Employee, value: any) => {
        setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
                emp.id === id ? { ...emp, [field]: value } : emp
            )
        );
    };

    const updateCompany = (field: keyof CompanyInfo, value: string) => {
        setCompany(prev => ({ ...prev, [field]: value }));
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

    const parseDateFromString = (dateStr: any): string => {
        if (!dateStr) return '';

        try {
            // If it's already a Date object
            if (dateStr instanceof Date) {
                const year = dateStr.getFullYear();
                const month = String(dateStr.getMonth() + 1).padStart(2, '0');
                const day = String(dateStr.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            // Convert to string
            const str = String(dateStr);

            // Try different date formats
            let date: Date | null = null;

            // Format: DD.MM.YYYY
            if (str.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                const [day, month, year] = str.split('.').map(Number);
                date = new Date(year, month - 1, day);
            }
            // Format: DD/MM/YYYY
            else if (str.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                const [day, month, year] = str.split('/').map(Number);
                date = new Date(year, month - 1, day);
            }
            // Format: YYYY-MM-DD (ISO)
            else if (str.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                date = new Date(str);
            }
            // Try parsing as is
            else {
                date = new Date(str);
            }

            // Check if date is valid
            if (date && !isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch (error) {
            console.error('Error parsing date:', dateStr, error);
        }

        return '';
    };

    const handlePhotoUpload = async (id: number, file: File) => {
        if (!file) return;

        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Vă rugăm să încărcați o imagine (JPG, PNG, etc.)');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Dimensiunea fișierului trebuie să fie mai mică de 5MB');
            return;
        }

        // Clean up old preview URL if exists
        const oldEmployee = employees.find(emp => emp.id === id);
        if (oldEmployee?.photo_preview_url) {
            URL.revokeObjectURL(oldEmployee.photo_preview_url);
        }

        // Create preview URL for display
        const previewUrl = URL.createObjectURL(file);

        // Set loading state and update immediately
        updateEmployee(id, 'photo_file', file);
        updateEmployee(id, 'photo_preview_url', previewUrl);
        updateEmployee(id, 'photo_loading', true);

        // Add to processing list
        setPhotoProcessing(prev => [...prev, id]);

        // Convert image to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data:image/...;base64, prefix
            const base64Data = base64String.split(',')[1];

            // Update with base64 data
            updateEmployee(id, 'photo_base64', base64Data);
            updateEmployee(id, 'photo_loading', false);

            // Remove from processing list
            setPhotoProcessing(prev => prev.filter(pid => pid !== id));
        };

        reader.onerror = () => {
            console.error('Error reading file for employee', id);
            updateEmployee(id, 'photo_loading', false);
            setPhotoProcessing(prev => prev.filter(pid => pid !== id));
            alert('Eroare la procesarea fotografiei');
        };

        reader.readAsDataURL(file);
    };

    const removePhoto = (id: number) => {
        const employee = employees.find(emp => emp.id === id);
        if (employee?.photo_preview_url) {
            URL.revokeObjectURL(employee.photo_preview_url);
        }

        updateEmployee(id, 'photo_file', null);
        updateEmployee(id, 'photo_base64', null);
        updateEmployee(id, 'photo_preview_url', null);
        updateEmployee(id, 'photo_loading', false);

        // Remove from processing list if present
        setPhotoProcessing(prev => prev.filter(pid => pid !== id));

        // Reset file input
        if (fileInputRefs.current[id]) {
            fileInputRefs.current[id]!.value = '';
        }
    };

    const triggerFileInput = (id: number) => {
        if (fileInputRefs.current[id]) {
            fileInputRefs.current[id]!.click();
        }
    };

    // Функция для скачивания шаблона Excel
    const downloadTemplate = () => {
        // Создаем данные для примера
        const exampleData = [
            {
                'Nume complet': 'POPESCU ION',
                'CNP': '1890101123456',
                'Tip document': 'permisului de sedere',
                'Număr document': 'AB123456',
                'Emis de': 'Inspectoratul General pentru Imigrări',
                'Data emitere': '2023-01-15',
                'Număr contract': 'C001/2024',
                'Data începere contract': '2024-01-01',
                'Salariu (lei)': '4050',
                'Cod COR': 'cor 962101',
                'Funcția': 'CURIER',
                'Adresa angajat': 'Str. Libertatii, Nr. 10, Bucuresti'
            },
            {
                'Nume complet': 'IONESCU MARIA',
                'CNP': '2950202123456',
                'Tip document': 'bulletin romanesc',
                'Număr document': 'BK789012',
                'Emis de': 'Primăria Sector 1',
                'Data emitere': '2022-05-20',
                'Număr contract': 'C002/2024',
                'Data începere contract': '2024-01-15',
                'Salariu (lei)': '4200',
                'Cod COR': 'cor 962101',
                'Funcția': 'CURIER',
                'Adresa angajat': 'Str. Unirii, Nr. 25, Bucuresti'
            }
        ];

        // Создаем workbook и worksheet
        const ws = XLSX.utils.json_to_sheet(exampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Angajati');

        // Устанавливаем ширину колонок
        const wscols = [
            { wch: 20 }, // Nume complet
            { wch: 15 }, // CNP
            { wch: 20 }, // Tip document
            { wch: 15 }, // Număr document
            { wch: 30 }, // Emis de
            { wch: 12 }, // Data emitere
            { wch: 15 }, // Număr contract
            { wch: 12 }, // Data începere contract
            { wch: 12 }, // Salariu (lei)
            { wch: 15 }, // Cod COR
            { wch: 15 }, // Funcția
            { wch: 40 }, // Adresa angajat
        ];
        ws['!cols'] = wscols;

        // Генерируем Excel файл и скачиваем
        XLSX.writeFile(wb, 'Model_Date_Angajati.xlsx');
    };

    // Функция для скачивания шаблона CSV
    const downloadCSVTemplate = () => {
        const headers = [
            'Nume complet',
            'CNP',
            'Tip document',
            'Număr document',
            'Emis de',
            'Data emitere',
            'Număr contract',
            'Data începere contract',
            'Salariu (lei)',
            'Cod COR',
            'Funcția',
            'Adresa angajat'
        ];

        const exampleData = [
            [
                'POPESCU ION',
                '1890101123456',
                'permisului de sedere',
                'AB123456',
                'Inspectoratul General pentru Imigrări',
                '2023-01-15',
                'C001/2024',
                '2024-01-01',
                '4050',
                'cor 962101',
                'CURIER',
                'Str. Libertatii, Nr. 10, Bucuresti'
            ],
            [
                'IONESCU MARIA',
                '2950202123456',
                'bulletin romanesc',
                'BK789012',
                'Primăria Sector 1',
                '2022-05-20',
                'C002/2024',
                '2024-01-15',
                '4200',
                'cor 962101',
                'CURIER',
                'Str. Unirii, Nr. 25, Bucuresti'
            ]
        ];

        const csvContent = [
            headers.join(','),
            ...exampleData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Model_Date_Angajati.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Функция для импорта данных из файла
    const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportStats(null);

        try {
            // Проверяем тип файла
            const fileName = file.name.toLowerCase();
            const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            const isCSV = fileName.endsWith('.csv');

            if (!isExcel && !isCSV) {
                alert('Vă rugăm să încărcați un fișier Excel (.xlsx, .xls) sau CSV (.csv)');
                setImporting(false);
                return;
            }

            // Подтверждение перед очисткой существующих данных
            const shouldClear = window.confirm(
                'Înainte de import, toți angajații existenți vor fi șterși. Doriți să continuați?'
            );

            if (!shouldClear) {
                setImporting(false);
                // Очищаем input
                if (importFileInputRef.current) {
                    importFileInputRef.current.value = '';
                }
                return;
            }

            // Очищаем существующих сотрудников и их preview URL
            employees.forEach(emp => {
                if (emp.photo_preview_url) {
                    URL.revokeObjectURL(emp.photo_preview_url);
                }
            });

            // Очищаем refs
            fileInputRefs.current = {};

            // Читаем файл
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });

            // Берем первый лист
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length < 2) {
                alert('Fișierul nu conține date. Vă rugăm să utilizați șablonul.');
                setImporting(false);
                return;
            }

            // Получаем заголовки (первая строка)
            const headers = jsonData[0] as string[];

            // Маппинг заголовков на поля
            const fieldMapping: Record<string, keyof Employee> = {
                // Румынские заголовки
                'Nume complet': 'employee_name_worker_field',
                'Nume': 'employee_name_worker_field',
                'Nume si Prenume': 'employee_name_worker_field',
                'CNP': 'document_cnp_worker_field',
                'Tip document': 'type_of_document_worker_field',
                'Tip Document': 'type_of_document_worker_field',
                'Numar document': 'document_seria_number_worker_field',
                'Număr document': 'document_seria_number_worker_field',
                'Serie si numar': 'document_seria_number_worker_field',
                'Serie și număr': 'document_seria_number_worker_field',
                'Emis de': 'document_given_by_worker_field',
                'Emitent': 'document_given_by_worker_field',
                'Data emitere': 'document_creation_date_worker_field',
                'Data emiterii': 'document_creation_date_worker_field',
                'Data document': 'document_creation_date_worker_field',
                'Numar contract': 'contract_number_worker_field',
                'Număr contract': 'contract_number_worker_field',
                'Contract nr': 'contract_number_worker_field',
                'Data inceput': 'starting_date_worker_field',
                'Data început': 'starting_date_worker_field',
                'Data angajare': 'starting_date_worker_field',
                'Data start': 'starting_date_worker_field',
                'Salariu': 'salary_worker_field',
                'Salariu (lei)': 'salary_worker_field',
                'Salariu brut': 'salary_worker_field',
                'COD COR': 'cor_worker_field',
                'Cod COR': 'cor_worker_field',
                'COR': 'cor_worker_field',
                'Functie': 'worker_position_worker_field',
                'Funcție': 'worker_position_worker_field',
                'Post': 'worker_position_worker_field',
                'Pozitie': 'worker_position_worker_field',
                'Poziție': 'worker_position_worker_field',
                'Adresa': 'employee_address_worker_field',
                'Adresa angajat': 'employee_address_worker_field',
                'Domiciliu': 'employee_address_worker_field',
            };

            // Собираем импортированных сотрудников
            const importedEmployees: Employee[] = [];
            let importedCount = 0;
            let failedCount = 0;

            // Проходим по строкам данных (начиная со второй строки)
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i] as any[];

                // Пропускаем пустые строки
                if (!row || row.length === 0 || (row.every(cell => !cell && cell !== 0))) {
                    continue;
                }

                const newEmployee: Employee = {
                    id: importedEmployees.length + 1, // Начинаем с 1 для чистого импорта
                    employee_name_worker_field: '',
                    employee_address_worker_field: '',
                    document_cnp_worker_field: '',
                    type_of_document_worker_field: 'permisului de sedere',
                    document_seria_number_worker_field: '',
                    document_given_by_worker_field: '',
                    document_creation_date_worker_field: '',
                    contract_number_worker_field: '',
                    starting_date_worker_field: '',
                    salary_worker_field: '4050',
                    cor_worker_field: 'cor 962101',
                    worker_position_worker_field: 'CURIER',
                    photo_file: null,
                    photo_base64: null,
                    photo_preview_url: null,
                    photo_loading: false
                };

                let hasRequiredData = false;

                // Заполняем поля на основе заголовков
                headers.forEach((header, index) => {
                    if (!header || index >= row.length || row[index] === undefined || row[index] === null || row[index] === '') {
                        return;
                    }

                    const fieldName = fieldMapping[header.trim()];
                    if (fieldName) {
                        const value = row[index];

                        // Особые обработки для некоторых полей
                        if (fieldName === 'document_creation_date_worker_field' || fieldName === 'starting_date_worker_field') {
                            (newEmployee as Record<string, any>)[fieldName] = parseDateFromString(value);
                        } else {
                            (newEmployee as Record<string, any>)[fieldName] = String(value);
                        }

                        // Проверяем обязательные поля
                        if ((fieldName === 'employee_name_worker_field' || fieldName === 'document_cnp_worker_field') && value) {
                            hasRequiredData = true;
                        }
                    }
                });

                if (hasRequiredData) {
                    importedEmployees.push(newEmployee);
                    importedCount++;
                } else {
                    failedCount++;
                }
            }

            // Заменяем всех сотрудников на импортированных
            if (importedEmployees.length > 0) {
                setEmployees(importedEmployees);

                setImportStats({
                    total: importedEmployees.length + failedCount,
                    imported: importedCount,
                    failed: failedCount
                });

                alert(`Import finalizat cu succes!\n\nImportate: ${importedCount} angajați\nEșuate: ${failedCount} înregistrări\n\nToți angajații anteriori au fost șterși.`);

                // Переключаемся на вкладку сотрудников
                setActiveTab('employees');
            } else {
                alert('Nu s-au putut importa date. Verificați că fișierul conține coloanele cerute și datele necesare.');
                // Если импорт не удался, оставляем пустой массив
                setEmployees([]);
            }

        } catch (error) {
            console.error('Error importing file:', error);
            alert('Eroare la importul fișierului. Verificați formatul fișierului.');
            // В случае ошибки, оставляем пустой массив
            setEmployees([]);
        } finally {
            setImporting(false);
            // Очищаем input
            if (importFileInputRef.current) {
                importFileInputRef.current.value = '';
            }
        }
    };

    const triggerImportFileInput = () => {
        if (importFileInputRef.current) {
            importFileInputRef.current.click();
        }
    };

    const handleGenerate = async () => {
        if (!company.company_name_company_field || !company.company_fiscal_code_company_field) {
            alert('Vă rugăm să completați informațiile companiei');
            return;
        }

        const validEmployees = employees.filter(emp =>
            emp.employee_name_worker_field.trim() && emp.document_cnp_worker_field.trim()
        );

        if (validEmployees.length === 0) {
            alert('Vă rugăm să adăugați cel puțin un angajat cu nume și CNP');
            return;
        }

        // Check if photos are still processing
        if (photoProcessing.length > 0) {
            alert('Vă rugăm să așteptați până se termină procesarea fotografiilor încărcate.');
            return;
        }

        // Check employees with photo_file but without photo_base64 (processing failed)
        const employeesWithFailedPhotos = validEmployees.filter(emp =>
            emp.photo_file && !emp.photo_base64
        );

        if (employeesWithFailedPhotos.length > 0) {
            const names = employeesWithFailedPhotos.map(emp => emp.employee_name_worker_field).join(', ');
            alert(`Fotografiile pentru următorii angajați nu au putut fi procesate: ${names}. Vă rugăm să încărcați din nou fotografiile.`);
            return;
        }

        // Check which employees have photos
        const employeesWithPhotos = validEmployees.filter(emp => emp.photo_base64);
        const employeesWithoutPhotos = validEmployees.filter(emp => !emp.photo_base64);

        if (employeesWithoutPhotos.length > 0) {
            const names = employeesWithoutPhotos.map(emp => emp.employee_name_worker_field).join(', ');
            const confirmMessage = employeesWithoutPhotos.length === 1
                ? `Angajatul "${names}" nu are o fotografie încărcată. Doriți să continuați fără fotografie?`
                : `Următorii angajați nu au fotografii încărcate: ${names}. Doriți să continuați fără fotografii?`;

            if (!confirm(confirmMessage)) {
                return;
            }
        }

        setLoading(true);

        try {
            const requestData = {
                company: {
                    ...company
                },
                employees: validEmployees.map(emp => ({
                    employee_name_worker_field: emp.employee_name_worker_field,
                    employee_address_worker_field: emp.employee_address_worker_field,
                    document_cnp_worker_field: emp.document_cnp_worker_field,
                    type_of_document_worker_field: emp.type_of_document_worker_field,
                    document_seria_number_worker_field: emp.document_seria_number_worker_field,
                    document_given_by_worker_field: emp.document_given_by_worker_field,
                    document_creation_date_worker_field: formatDate(emp.document_creation_date_worker_field),
                    contract_number_worker_field: emp.contract_number_worker_field,
                    starting_date_worker_field: formatDate(emp.starting_date_worker_field),
                    salary_worker_field: emp.salary_worker_field,
                    cor_worker_field: emp.cor_worker_field,
                    worker_position_worker_field: emp.worker_position_worker_field,
                    photo_base64: emp.photo_base64 || null
                }))
            };

            const response = await fetch('/api/generate-documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`HTTP ${response.status}: ${error}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const firstName = validEmployees[0]?.employee_name_worker_field || 'Documente';
            const safeName = firstName
                .replace(/[^a-zA-Z0-9ăâîșțĂÂÎȘȚ ]/g, '')
                .replace(/\s+/g, '_');

            if (validEmployees.length === 1) {
                link.download = `${safeName}_Documente.zip`;
            } else {
                const today = new Date().toISOString().split('T')[0];
                link.download = `Documente_Angajati_${today}.zip`;
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error:', error);
            alert('Eroare la generarea documentelor');
        } finally {
            setLoading(false);
        }
    };

    // Correct ref handler function
    const setFileInputRef = (id: number, el: HTMLInputElement | null) => {
        if (el) {
            fileInputRefs.current[id] = el;
        }
    };

    return (
        <>
            <header className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Generator Documente Angajați</h1>
                        <p className="text-gray-600 text-sm">Generați documente pentru angajați</p>
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
                                                value={company.company_name_company_field}
                                                onChange={(e) => updateCompany('company_name_company_field', e.target.value)}
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
                                                value={company.company_fiscal_code_company_field}
                                                onChange={(e) => updateCompany('company_fiscal_code_company_field', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                placeholder="RO12345678"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Reprezentant Legal
                                            </label>
                                            <input
                                                type="text"
                                                value={company.company_owner_company_field}
                                                onChange={(e) => updateCompany('company_owner_company_field', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                placeholder="Nume reprezentant"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Adresa Companie
                                            </label>
                                            <textarea
                                                value={company.company_address_company_field}
                                                onChange={(e) => updateCompany('company_address_company_field', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                placeholder="Adresa completa a companiei"
                                                rows={3}
                                            />
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
                                <div className="flex space-x-2">
                                    <button
                                        onClick={addEmployee}
                                        className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Adaugă manual
                                    </button>
                                </div>
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
                                                        value={employee.employee_name_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'employee_name_worker_field', e.target.value)}
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
                                                        value={employee.document_cnp_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'document_cnp_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="CNP"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Tip Document
                                                    </label>
                                                    <select
                                                        value={employee.type_of_document_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'type_of_document_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    >
                                                        <option value="permisului de sedere">Permis de ședere</option>
                                                        <option value="bulletin romanesc">Bulletin românesc</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Număr Document
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.document_seria_number_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'document_seria_number_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Număr document"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Emis de
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.document_given_by_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'document_given_by_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Instituția emitentă"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data emitere document
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.document_creation_date_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'document_creation_date_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Număr contract
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.contract_number_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'contract_number_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Număr contract"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data începere contract
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.starting_date_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'starting_date_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Salariu (lei)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.salary_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'salary_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="4050"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Cod COR
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.cor_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'cor_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="cor 962101"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Funcția
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.worker_position_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'worker_position_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="CURIER"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Adresa angajat
                                                    </label>
                                                    <textarea
                                                        value={employee.employee_address_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'employee_address_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Adresa completa a angajatului"
                                                        rows={2}
                                                    />
                                                </div>

                                                {/* Photo Upload Section */}
                                                <div className="pt-2 border-t border-gray-200">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Fotografie document (opțional)
                                                    </label>

                                                    <input
                                                        type="file"
                                                        ref={(el) => setFileInputRef(employee.id, el)}
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handlePhotoUpload(employee.id, e.target.files[0]);
                                                            }
                                                        }}
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={employee.photo_loading}
                                                    />

                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerFileInput(employee.id)}
                                                                disabled={employee.photo_loading}
                                                                className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center ${employee.photo_loading
                                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                                            >
                                                                {employee.photo_loading ? (
                                                                    <>
                                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        Se procesează...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                        {employee.photo_file ? 'Schimbă foto' : 'Încarcă foto'}
                                                                    </>
                                                                )}
                                                            </button>

                                                            {employee.photo_file && !employee.photo_loading && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removePhoto(employee.id)}
                                                                    className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Photo Preview */}
                                                        {employee.photo_preview_url && (
                                                            <div className={`mt-2 p-2 rounded ${employee.photo_loading
                                                                ? 'border border-blue-200 bg-blue-50'
                                                                : 'border border-green-200 bg-green-50'}`}>
                                                                <div className="flex items-start gap-3">
                                                                    <div className="relative">
                                                                        <img
                                                                            src={employee.photo_preview_url}
                                                                            alt="Preview foto document"
                                                                            className="w-20 h-20 object-cover rounded border border-gray-300"
                                                                        />
                                                                        {!employee.photo_loading && (
                                                                            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        {employee.photo_loading ? (
                                                                            <>
                                                                                <p className="text-sm font-medium text-blue-700">
                                                                                    Se procesează fotografia...
                                                                                </p>
                                                                                <p className="text-xs text-blue-600">
                                                                                    {employee.photo_file?.name}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    Așteptați până se termină procesarea.
                                                                                </p>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <p className="text-sm font-medium text-green-700">
                                                                                    ✓ Fotografie încărcată
                                                                                </p>
                                                                                <p className="text-xs text-green-600">
                                                                                    {employee.photo_file?.name}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    Va fi convertită în PDF și inclusă în documentele generate.
                                                                                </p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {!employee.photo_preview_url && !employee.photo_loading && (
                                                            <div className="mt-1">
                                                                <p className="text-xs text-gray-500">
                                                                    Acceptă imagini (JPG, PNG). Maxim 5MB. Imaginea va fi convertită în PDF.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
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
                    {/* Import/Export Card */}
                    <div className="bg-white rounded border border-gray-300 p-4">
                        <h3 className="text-md font-semibold text-gray-800 mb-3">Import/Export</h3>

                        {/* Hidden file input for import */}
                        <input
                            type="file"
                            ref={importFileInputRef}
                            onChange={handleImportFile}
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                        />

                        <div className="space-y-2">
                            <button
                                onClick={triggerImportFileInput}
                                disabled={importing}
                                className={`w-full px-4 py-2 rounded transition-colors flex items-center justify-center text-sm ${importing
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                {importing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Se importă...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                        </svg>
                                        Importă date din fișier
                                    </>
                                )}
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={downloadTemplate}
                                    className="px-3 py-2 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100 transition-colors flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Excel
                                </button>

                                <button
                                    onClick={downloadCSVTemplate}
                                    className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded text-sm hover:bg-yellow-100 transition-colors flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    CSV
                                </button>
                            </div>

                            {/* Import Stats */}
                            {importStats && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                                    <p className="font-medium text-blue-800 mb-1">Rezultat import:</p>
                                    <div className="space-y-1 text-blue-700">
                                        <p>• Total înregistrări: {importStats.total}</p>
                                        <p>• Importate cu succes: {importStats.imported}</p>
                                        <p>• Eșuate: {importStats.failed}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-600">
                                    <strong>Instrucțiuni:</strong> Descărcați șablonul, completați datele pentru fiecare angajat, apoi încărcați fișierul.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    <strong>Coloane obligatorii:</strong> Nume complet, CNP
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white rounded border border-gray-300 p-4">
                        <h3 className="text-md font-semibold text-gray-800 mb-3">Generare</h3>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || photoProcessing.length > 0}
                            className={`w-full px-4 py-2.5 rounded transition-colors flex items-center justify-center text-sm ${loading || photoProcessing.length > 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Se generează...
                                </>
                            ) : photoProcessing.length > 0 ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Se procesează fotografii...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Generează documente
                                </>
                            )}
                        </button>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Documente generate</h4>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>• Fișa de post curier</p>
                                <p>• Contract individual de muncă</p>
                                <p>• Cerere încetare CIM</p>
                                <p>• Cerere concediu de odihnă</p>
                                <p>• GDPR (Protectia datelor personale)</p>
                                <p>• Fotografie document (PDF)</p>
                                <p className="mt-2">Câmpurile marcate cu * sunt obligatorii</p>

                                {photoProcessing.length > 0 && (
                                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                        <p className="font-medium mb-1">📸 Procesare fotografii:</p>
                                        <p>Se procesează {photoProcessing.length} fotografie...</p>
                                        <p className="mt-1 text-xs">Așteptați până se termină procesarea.</p>
                                    </div>
                                )}
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

export default GenerateEmployeeRequiredDocuments