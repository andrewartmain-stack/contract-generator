"use client"

import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Employee {
    id: number;
    employee_name_worker_field: string;
    employee_address_worker_field: string;
    document_cnp_worker_field: string;
    country_worker_field: string;
    employee_dob_worker_field: string;
    document_seria_number_worker_field: string;
    issued_by_worker_field: string;
    work_permit_worker_field: string;
    permit_issued_worker_field: string;
    activity_start_worker_field: string;
    contract_number_worker_field: string;
    contract_creation_date_worker_field: string;
    salary_worker_field: string;
    cor_worker_field: string;
    worker_position_worker_field: string;
    comodant_worker_field: string;
    comodant_address_worker_field: string;
    comodant_cnp_worker_field: string;
    comodant_end_worker_field: string;
    photo_file: File | null;
    photo_base64: string | null;
    photo_preview_url: string | null;
    photo_loading: boolean;
}

interface CompanyInfo {
    company_name_company_field: string;
    company_address_company_field: string;
    company_registrul_comertului_company_field: string;
    company_fiscal_code_company_field: string;
    company_owner_company_field: string;
}

interface CompanyCard {
    id: number;
    name: string;
    address: string;
    fiscalCode: string;
    registrulComertului: string;
    owner: string
}

const GenerateEmployeeEmbessyDocuments = () => {
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
    const importFileInputRef = useRef<HTMLInputElement>(null);

    // Данные компаний с Registrul Comertului
    const companiesData: CompanyCard[] = [
        {
            id: 1,
            name: "STEF FLYCAR DRIVE S.R.L.",
            address: "Jud. Iaşi, Municipiul Iaşi, Şoseaua ARCU, Nr. 18, cam.1, Bl. Z16, Scara A, Ap. 1",
            fiscalCode: "52720420",
            registrulComertului: "J2025079704000",
            owner: "ȘTEFĂNESCU DĂNUȚ-FLORIN"
        },
        {
            id: 2,
            name: "STEF ENGO DRIVE S.R.L",
            address: "Jud. Cluj, Municipiul Cluj-Napoca, Aleea RETEZAT, Nr. 5, CAMERA NR.1, Scara 1, Etaj 2, Ap. 6",
            fiscalCode: "52719379",
            registrulComertului: "J2025079655005",
            owner: "ȘTEFĂNESCU DĂNUȚ-FLORIN"
        },
        {
            id: 3,
            name: "STEF LIFE DRIVE S.R.L",
            address: "Jud. Timiş, Municipiul Timişoara, Strada LABIRINT, Nr. 18, CAMERA NR. 1, Bl. B12, Scara A, Etaj 3, Ap. 14",
            fiscalCode: "52737316",
            registrulComertului: "J2025080478000",
            owner: "ȘTEFĂNESCU DĂNUȚ-FLORIN"
        },
        {
            id: 4,
            name: "STEF EDEN ENGO DRIVE S.R.L.",
            address: "Jud. Argeş, Municipiul Piteşti, Aleea VOINICILOR, Nr. 5, camera nr.1, Bl. P14, Scara A, Etaj 3, Ap. 12",
            fiscalCode: "52720098",
            registrulComertului: "J2025079683006",
            owner: "ȘTEFĂNESCU DĂNUȚ-FLORIN"
        },
        {
            id: 5,
            name: "STEF EDEN DRIVE S.R.L",
            address: "Bucureşti Sectorul 2, Strada POIANA CU ALUNI, Nr. 6, CAMERA NR. 2, Bl. 17, Scara 3, Etaj 4, Ap. 89",
            fiscalCode: "52725907",
            registrulComertului: "J2025079871005",
            owner: "ȘTEFĂNESCU DĂNUȚ-FLORIN"
        },
        {
            id: 6,
            name: "SF CONSTRUCT MOBILITY S.R.L.",
            address: "Oraş Pantelimon, Strada MAGHERANULUI, Nr. 16, Camera 1, Județ Ilfov",
            fiscalCode: "47239471",
            registrulComertului: "J23/8144/24.11.2022",
            owner: "FRINCU DANIEL-FLORIN"
        },
        {
            id: 7,
            name: "PLUMA & PURGATO S.R.L.",
            address: "BUCUREȘTI, sector 2, Str. DÂMBOVICIOARA, Nr. 17, Et. 1, Ap. 3, județ BUCUREȘTI",
            fiscalCode: "47953100",
            registrulComertului: "J40/6686/2023",
            owner: "IUGA IRINA ANDREEA"
        }
    ];

    const [company, setCompany] = useState<CompanyInfo>({
        company_name_company_field: '',
        company_address_company_field: '',
        company_registrul_comertului_company_field: '',
        company_fiscal_code_company_field: '',
        company_owner_company_field: '',
    });

    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

    const [employees, setEmployees] = useState<Employee[]>([
        {
            id: 1,
            employee_name_worker_field: '',
            employee_address_worker_field: '',
            document_cnp_worker_field: '',
            country_worker_field: '',
            employee_dob_worker_field: '',
            document_seria_number_worker_field: '',
            issued_by_worker_field: '',
            work_permit_worker_field: '',
            permit_issued_worker_field: '',
            activity_start_worker_field: '',
            contract_number_worker_field: '',
            contract_creation_date_worker_field: '',
            salary_worker_field: '4050lei/900E',
            cor_worker_field: 'cor 962101',
            worker_position_worker_field: 'COURIER',
            comodant_worker_field: 'Alazem Muhamed Anas',
            comodant_address_worker_field: '',
            comodant_cnp_worker_field: '19508094200115',
            comodant_end_worker_field: '',
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

    // Calculate activity start date (permit_issued + 30 days) and comodant end date (activity_start + 6 months)
    useEffect(() => {
        employees.forEach((employee) => {
            if (employee.permit_issued_worker_field) {
                const permitDate = new Date(employee.permit_issued_worker_field);
                permitDate.setDate(permitDate.getDate() + 30);
                const activityStartDate = permitDate.toISOString().split('T')[0];

                if (employee.activity_start_worker_field !== activityStartDate) {
                    updateEmployee(employee.id, 'activity_start_worker_field', activityStartDate);

                    // Calculate comodant end date (activity_start + 6 months)
                    const activityStart = new Date(activityStartDate);
                    activityStart.setMonth(activityStart.getMonth() + 6);
                    const comodantEndDate = activityStart.toISOString().split('T')[0];
                    updateEmployee(employee.id, 'comodant_end_worker_field', comodantEndDate);
                }
            }
        });
    }, [employees]);

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

    // Функция для выбора компании
    const handleCompanySelect = (companyCard: CompanyCard) => {
        setSelectedCompanyId(companyCard.id);
        setCompany({
            company_name_company_field: companyCard.name,
            company_address_company_field: companyCard.address,
            company_registrul_comertului_company_field: companyCard.registrulComertului,
            company_fiscal_code_company_field: companyCard.fiscalCode,
            company_owner_company_field: companyCard.owner
        });
    };

    const addEmployee = () => {
        const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        setEmployees([...employees, {
            id: newId,
            employee_name_worker_field: '',
            employee_address_worker_field: '',
            document_cnp_worker_field: '',
            country_worker_field: '',
            employee_dob_worker_field: '',
            document_seria_number_worker_field: '',
            issued_by_worker_field: '',
            work_permit_worker_field: '',
            permit_issued_worker_field: '',
            activity_start_worker_field: '',
            contract_number_worker_field: '',
            contract_creation_date_worker_field: '',
            salary_worker_field: '4050lei/900E',
            cor_worker_field: 'cor 962101',
            worker_position_worker_field: 'COURIER',
            comodant_worker_field: 'Alazem Muhamed Anas',
            comodant_address_worker_field: '',
            comodant_cnp_worker_field: '19508094200115',
            comodant_end_worker_field: '',
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
            prevEmployees.map(emp => {
                if (emp.id === id) {
                    const updatedEmployee = { ...emp, [field]: value };

                    // Recalculate dates if permit issued date changes
                    if (field === 'permit_issued_worker_field' && value) {
                        const permitDate = new Date(value);
                        permitDate.setDate(permitDate.getDate() + 30);
                        const activityStartDate = permitDate.toISOString().split('T')[0];
                        updatedEmployee.activity_start_worker_field = activityStartDate;

                        // Calculate comodant end date
                        const activityStart = new Date(activityStartDate);
                        activityStart.setMonth(activityStart.getMonth() + 6);
                        updatedEmployee.comodant_end_worker_field = activityStart.toISOString().split('T')[0];
                    }

                    return updatedEmployee;
                }
                return emp;
            })
        );
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
            // Если это число (Excel дата), то преобразуем
            if (typeof dateStr === 'number') {
                // Excel даты считаются с 01.01.1900
                const excelEpoch = new Date(1899, 11, 30);
                const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            // Преобразуем в строку
            const str = String(dateStr).trim();

            // Формат: DD-MM-YYYY (из вашего файла)
            if (str.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                const [day, month, year] = str.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                const formattedYear = date.getFullYear();
                const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
                const formattedDay = String(date.getDate()).padStart(2, '0');
                return `${formattedYear}-${formattedMonth}-${formattedDay}`;
            }

            // Формат: DD.MM.YYYY
            if (str.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                const [day, month, year] = str.split('.').map(Number);
                const date = new Date(year, month - 1, day);
                const formattedYear = date.getFullYear();
                const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
                const formattedDay = String(date.getDate()).padStart(2, '0');
                return `${formattedYear}-${formattedMonth}-${formattedDay}`;
            }

            // Формат: YYYY-MM-DD (ISO)
            if (str.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                return str;
            }

            // Пробуем стандартный парсинг
            const date = new Date(str);
            if (!isNaN(date.getTime())) {
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
                'Țara': 'Republica Moldova',
                'Data nașterii': '1989-01-01',
                'Număr document': 'AB123456',
                'Emis de': 'Inspectoratul General pentru Imigrări',
                'Aviz de muncă': 'AV12345/2024',
                'Data aviz muncă': '2024-01-15',
                'Număr contract': 'C001/2024',
                'Data contract': '2024-01-01',
                'Salariu': '4050lei/900E',
                'Cod COR': 'cor 962101',
                'Funcția': 'COURIER',
                'Adresa angajat': 'Str. Libertatii, Nr. 10, Bucuresti',
                'Adresa comodant': 'Str. Mihai Viteazu, Nr. 5, Bucuresti',
                'Nume comodant': 'Alazem Muhamed Anas',
                'CNP comodant': '19508094200115'
            },
            {
                'Nume complet': 'IONESCU MARIA',
                'CNP': '2950202123456',
                'Țara': 'Ucraina',
                'Data nașterii': '1995-02-02',
                'Număr document': 'BK789012',
                'Emis de': 'Primăria Sector 1',
                'Aviz de muncă': 'AV67890/2024',
                'Data aviz muncă': '2024-02-20',
                'Număr contract': 'C002/2024',
                'Data contract': '2024-01-15',
                'Salariu': '4200lei/850E',
                'Cod COR': 'cor 962101',
                'Funcția': 'COURIER',
                'Adresa angajat': 'Str. Unirii, Nr. 25, Bucuresti',
                'Adresa comodant': 'Str. Victoriei, Nr. 8, Bucuresti',
                'Nume comodant': 'Alazem Muhamed Anas',
                'CNP comodant': '19508094200115'
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
            { wch: 20 }, // Țara
            { wch: 12 }, // Data nașterii
            { wch: 15 }, // Număr document
            { wch: 30 }, // Emis de
            { wch: 15 }, // Aviz de muncă
            { wch: 12 }, // Data aviz muncă
            { wch: 15 }, // Număr contract
            { wch: 12 }, // Data contract
            { wch: 15 }, // Salariu
            { wch: 15 }, // Cod COR
            { wch: 15 }, // Funcția
            { wch: 40 }, // Adresa angajat
            { wch: 40 }, // Adresa comodant
            { wch: 25 }, // Nume comodant
            { wch: 20 }, // CNP comodant
        ];
        ws['!cols'] = wscols;

        // Генерируем Excel файл и скачиваем
        XLSX.writeFile(wb, 'Model_Date_Angajati_Ambasada.xlsx');
    };

    // Функция для скачивания шаблона CSV
    const downloadCSVTemplate = () => {
        const headers = [
            'Nume complet',
            'CNP',
            'Țara',
            'Data nașterii',
            'Număr document',
            'Emis de',
            'Aviz de muncă',
            'Data aviz muncă',
            'Număr contract',
            'Data contract',
            'Salariu',
            'Cod COR',
            'Funcția',
            'Adresa angajat',
            'Adresa comodant',
            'Nume comodant',
            'CNP comodant'
        ];

        const exampleData = [
            [
                'POPESCU ION',
                '1890101123456',
                'Republica Moldova',
                '1989-01-01',
                'AB123456',
                'Inspectoratul General pentru Imigrări',
                'AV12345/2024',
                '2024-01-15',
                'C001/2024',
                '2024-01-01',
                '4050lei/900E',
                'cor 962101',
                'COURIER',
                'Str. Libertatii, Nr. 10, Bucuresti',
                'Str. Mihai Viteazu, Nr. 5, Bucuresti',
                'Alazem Muhamed Anas',
                '19508094200115'
            ],
            [
                'IONESCU MARIA',
                '2950202123456',
                'Ucraina',
                '1995-02-02',
                'BK789012',
                'Primăria Sector 1',
                'AV67890/2024',
                '2024-02-20',
                'C002/2024',
                '2024-01-15',
                '4200lei/850E',
                'cor 962101',
                'COURIER',
                'Str. Unirii, Nr. 25, Bucuresti',
                'Str. Victoriei, Nr. 8, Bucuresti',
                'Alazem Muhamed Anas',
                '19508094200115'
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
        link.setAttribute('download', 'Model_Date_Angajati_Ambasada.csv');
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

            // В функции handleImportFile обновите fieldMapping:
            const fieldMapping: Record<string, keyof Employee> = {
                // Соответствие колонкам из вашего Excel файла
                'Nume complet': 'employee_name_worker_field',
                'CNP': 'document_cnp_worker_field',
                'Țara': 'country_worker_field',
                'Tara': 'country_worker_field',
                'Data nașterii': 'employee_dob_worker_field',
                'Data nasterii': 'employee_dob_worker_field',
                'Număr document': 'document_seria_number_worker_field',
                'Numar document': 'document_seria_number_worker_field',
                'Emis de': 'issued_by_worker_field',
                'Aviz de muncă': 'work_permit_worker_field',
                'Aviz de munca': 'work_permit_worker_field',
                'Data aviz muncă': 'permit_issued_worker_field',
                'Data aviz munca': 'permit_issued_worker_field',
                'Număr contract': 'contract_number_worker_field',
                'Numar contract': 'contract_number_worker_field',
                'Data contract': 'contract_creation_date_worker_field',
                'Salariu': 'salary_worker_field',
                'Cod COR': 'cor_worker_field',
                'COD COR': 'cor_worker_field',
                'Funcția': 'worker_position_worker_field',  // Это критически важно!
                'Functie': 'worker_position_worker_field',
                'Funcție': 'worker_position_worker_field',
                'Adresa angajat': 'employee_address_worker_field',
                'Adresa comodant': 'comodant_address_worker_field',
                'Nume comodant': 'comodant_worker_field',
                'CNP comodant': 'comodant_cnp_worker_field'
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
                    id: importedEmployees.length + 1,
                    employee_name_worker_field: '',
                    employee_address_worker_field: '',
                    document_cnp_worker_field: '',
                    country_worker_field: '',
                    employee_dob_worker_field: '',
                    document_seria_number_worker_field: '',
                    issued_by_worker_field: '',
                    work_permit_worker_field: '',
                    permit_issued_worker_field: '',
                    activity_start_worker_field: '',
                    contract_number_worker_field: '',
                    contract_creation_date_worker_field: '',
                    salary_worker_field: '4050lei/900E',
                    cor_worker_field: 'cor 962101',
                    worker_position_worker_field: 'COURIER',
                    comodant_worker_field: 'Alazem Muhamed Anas',
                    comodant_address_worker_field: '',
                    comodant_cnp_worker_field: '19508094200115',
                    comodant_end_worker_field: '',
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

                        // Особые обработки для дат
                        if (fieldName === 'employee_dob_worker_field' ||
                            fieldName === 'permit_issued_worker_field' ||
                            fieldName === 'contract_creation_date_worker_field') {
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

                // Calculate derived dates
                if (newEmployee.permit_issued_worker_field) {
                    const permitDate = new Date(newEmployee.permit_issued_worker_field);
                    permitDate.setDate(permitDate.getDate() + 30);
                    newEmployee.activity_start_worker_field = permitDate.toISOString().split('T')[0];

                    const activityStart = new Date(newEmployee.activity_start_worker_field);
                    activityStart.setMonth(activityStart.getMonth() + 6);
                    newEmployee.comodant_end_worker_field = activityStart.toISOString().split('T')[0];
                }

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
                setEmployees([]);
            }

        } catch (error) {
            console.error('Error importing file:', error);
            alert('Eroare la importul fișierului. Verificați formatul fișierului.');
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
            alert('Vă rugăm să selectați o companie');
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
                    country_worker_field: emp.country_worker_field,
                    employee_dob_worker_field: formatDate(emp.employee_dob_worker_field),
                    document_seria_number_worker_field: emp.document_seria_number_worker_field,
                    issued_by_worker_field: emp.issued_by_worker_field,
                    work_permit_worker_field: emp.work_permit_worker_field,
                    permit_issued_worker_field: formatDate(emp.permit_issued_worker_field),
                    activity_start_worker_field: formatDate(emp.activity_start_worker_field),
                    contract_number_worker_field: emp.contract_number_worker_field,
                    contract_creation_date_worker_field: formatDate(emp.contract_creation_date_worker_field),
                    salary_worker_field: emp.salary_worker_field,
                    cor_worker_field: emp.cor_worker_field,
                    worker_position_worker_field: emp.worker_position_worker_field,
                    comodant_worker_field: emp.comodant_worker_field,
                    comodant_address_worker_field: emp.comodant_address_worker_field,
                    comodant_cnp_worker_field: emp.comodant_cnp_worker_field,
                    comodant_end_worker_field: formatDate(emp.comodant_end_worker_field),
                    photo_base64: emp.photo_base64 || null
                }))
            };

            const response = await fetch('/api/generate-embessy-documents', {
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
                link.download = `${safeName}_Documente_Ambasada.zip`;
            } else {
                const today = new Date().toISOString().split('T')[0];
                link.download = `Documente_Ambasada_${today}.zip`;
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
                        <h1 className="text-2xl font-bold text-gray-800">Generator Documente Ambasadă</h1>
                        <p className="text-gray-600 text-sm">Generați documente pentru ambasadă</p>
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
                                <h2 className="text-lg font-semibold text-gray-800">Selectare Companie</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Company Cards */}
                                <div>
                                    <h3 className="text-md font-medium text-gray-700 mb-3">Selectează Compania</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {companiesData.map((companyCard) => (
                                            <div
                                                key={companyCard.id}
                                                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedCompanyId === companyCard.id
                                                    ? 'border-gray-800 bg-gray-50 ring-1 ring-gray-800'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                                onClick={() => handleCompanySelect(companyCard)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-800 mb-1">{companyCard.name}</h4>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span>CUI: {companyCard.fiscalCode}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                <span>Reg. Comerț: {companyCard.registrulComertului}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {selectedCompanyId === companyCard.id && (
                                                        <div className="text-green-600">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{companyCard.address}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Company Info Display */}
                                <div className="border-t pt-6">
                                    <h3 className="text-md font-medium text-gray-700 mb-3">Informații Companie Selectate</h3>

                                    <div className="space-y-4">
                                        {/* Legal Representative - Статичное поле */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Reprezentant Legal
                                            </label>
                                            <div className="p-3 bg-gray-50 border border-gray-300 rounded text-gray-800">
                                                {company.company_owner_company_field}
                                            </div>
                                        </div>

                                        {/* Company Details Display */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nume Companie *
                                                </label>
                                                <div className={`p-3 border rounded ${company.company_name_company_field ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                                                    {company.company_name_company_field ? (
                                                        <span className="text-gray-800">{company.company_name_company_field}</span>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Selectați o companie</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Cod Fiscal (CUI) *
                                                </label>
                                                <div className={`p-3 border rounded ${company.company_fiscal_code_company_field ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                                                    {company.company_fiscal_code_company_field ? (
                                                        <span className="text-gray-800">{company.company_fiscal_code_company_field}</span>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Selectați o companie</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nr. Registrul Comerțului
                                                </label>
                                                <div className={`p-3 border rounded ${company.company_registrul_comertului_company_field ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                                                    {company.company_registrul_comertului_company_field ? (
                                                        <span className="text-gray-800">{company.company_registrul_comertului_company_field}</span>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Selectați o companie</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Adresa Companie
                                                </label>
                                                <div className={`p-3 border rounded ${company.company_address_company_field ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                                                    {company.company_address_company_field ? (
                                                        <span className="text-gray-800">{company.company_address_company_field}</span>
                                                    ) : (
                                                        <span className="text-gray-500 italic">Selectați o companie</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selected Company Indicator */}
                                        {selectedCompanyId && (
                                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex items-center">
                                                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-green-700">
                                                    Compania selectată: {companiesData.find(c => c.id === selectedCompanyId)?.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Employees Tab - остался без изменений */}
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
                                                        Țara
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.country_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'country_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Republica Moldova"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data nașterii
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.employee_dob_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'employee_dob_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
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
                                                        value={employee.issued_by_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'issued_by_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Instituția emitentă"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Aviz de muncă
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.work_permit_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'work_permit_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="Nr. aviz muncă"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data aviz muncă
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.permit_issued_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'permit_issued_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data începere activitate
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.activity_start_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'activity_start_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        readOnly
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Calculat automat (data aviz + 30 zile)</p>
                                                </div>

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
                                                        Data contract
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={employee.contract_creation_date_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'contract_creation_date_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Salariu
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={employee.salary_worker_field}
                                                        onChange={(e) => updateEmployee(employee.id, 'salary_worker_field', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                        placeholder="4050lei/900E"
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
                                                        placeholder="COURIER"
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

                                                <div className="border-t border-gray-200 pt-3">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Informații Comodat</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Nume comodant
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={employee.comodant_worker_field}
                                                                onChange={(e) => updateEmployee(employee.id, 'comodant_worker_field', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                                placeholder="Alazem Muhamed Anas"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                CNP comodant
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={employee.comodant_cnp_worker_field}
                                                                onChange={(e) => updateEmployee(employee.id, 'comodant_cnp_worker_field', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                                placeholder="19508094200115"
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Adresa comodant
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={employee.comodant_address_worker_field}
                                                                onChange={(e) => updateEmployee(employee.id, 'comodant_address_worker_field', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                                placeholder="Adresa comodant"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Data sfârșit comodat
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={employee.comodant_end_worker_field}
                                                                onChange={(e) => updateEmployee(employee.id, 'comodant_end_worker_field', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                                                                readOnly
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">Calculat automat (data începere + 6 luni)</p>
                                                        </div>
                                                    </div>
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
                                <p>• Contract de comodat</p>
                                <p>• Scrisoare de garanție</p>
                                <p>• Adeverință</p>
                                <p>• Contract individual de muncă</p>
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

export default GenerateEmployeeEmbessyDocuments