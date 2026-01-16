export interface Employee {
  id: number;
  name: string;
  passport: string;
  birthDate: string;
  country: string;
  city?: string;
  documentType?: string;
}

export interface Company {
  name: string;
  cnp: string;
  city: string;
  sector: string;
}

export interface ContractData {
  contractDate: string;
  contractStartDate: string;
  contractEndDate: string;
  company: Company;
  employee: Employee;
}
