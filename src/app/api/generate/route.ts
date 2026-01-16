import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Parse request data
    const data = await request.json();

    console.log('Generating contract for:', data.employee_name);

    // Path to the template file
    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      'CIM_DRAFT_WITH_PLACEHOLDERS.docx'
    );

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      console.error('Template not found at:', templatePath);
      return NextResponse.json(
        { error: 'Template file not found' },
        { status: 500 }
      );
    }

    // Read the template
    const content = fs.readFileSync(templatePath, 'binary');

    // Create PizZip instance
    const zip = new PizZip(content);

    // Initialize docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}',
      },
    });

    // Prepare template data with ALL placeholders from the document
    // All placeholders are optional - if not provided, they will be empty
    const templateData = {
      // Contract header
      contract_number: data.contract_number || '',
      contract_registration_date: data.contract_registration_date || '',

      // Company information (from form fields)
      company_name: data.company_name || '',
      company_city: data.company_city || '',
      company_street: data.company_street || '',
      company_building: data.company_building || '',
      company_apartment: data.company_apartment || '',
      company_county: data.company_county || '',
      company_fiscal_code: data.company_fiscal_code || '',
      company_representative: data.company_representative || '',

      // Employee information (from form fields)
      employee_name: data.employee_name || '',
      employee_city: data.employee_city || '',
      employee_street: data.employee_street || '',
      employee_number: data.employee_number || '',
      employee_building: data.employee_building || '',
      employee_apartment: data.employee_apartment || '',
      employee_county: data.employee_county || '',
      employee_residence_permit: data.employee_residence_permit || '',
      employee_residence_issued_by: data.employee_residence_issued_by || '',
      employee_residence_issued_date: data.employee_residence_issued_date || '',
      employee_cnp: data.employee_cnp || '',

      // Contract details (from form fields or defaults)
      contract_start_date: data.contract_start_date || '',
      probation_conditions: data.probation_conditions || '',
      workplace: data.workplace || '',
      workplace_alternative: data.workplace_alternative || '',
      workplace_area: data.workplace_area || '',
      workplace_benefits: data.workplace_benefits || '',
      workplace_supplements: data.workplace_supplements || '',
      workplace_transport: data.workplace_transport || '',
      shift_schedule: data.shift_schedule || '',
      vacation_days: data.vacation_days || '',
      salary_allowances: data.salary_allowances || '',
      salary_supplements_cash: data.salary_supplements_cash || '',
      salary_supplements_kind: data.salary_supplements_kind || '',
      salary_other_additions: data.salary_other_additions || '',
      overtime_rate: data.overtime_rate || '',
      payment_date: data.payment_date || '',
      payment_method: data.payment_method || '',
      dismissal_notice: data.dismissal_notice || '',
      resignation_notice: data.resignation_notice || '',
      other_clauses: data.other_clauses || '',
      digital_signature_usage: data.digital_signature_usage || '',
      professional_training: data.professional_training || '',
      personal_protective_equipment: data.personal_protective_equipment || '',
      work_equipment: data.work_equipment || '',
      hygiene_materials: data.hygiene_materials || '',
      protective_nutrition: data.protective_nutrition || '',
      other_health_safety: data.other_health_safety || '',
      collective_agreement_level: data.collective_agreement_level || '',

      // Fields that might come from other parts of the form
      employee_passport: data.employee_passport || '',
      employee_country: data.employee_country || '',
      employee_birth_date: data.employee_birth_date || '',
      job_position: data.job_position || 'CURIER',
      job_cor_code: data.job_cor_code || '962101',
      base_salary: data.base_salary || '4050',
      probation_period: data.probation_period || '90',
      work_schedule_type: data.work_schedule_type || 'Inegal',
      working_conditions: data.working_conditions || 'normale',
      additional_vacation_days: data.additional_vacation_days || '',
      salary_bonuses: data.salary_bonuses || '',
    };

    console.log('Template data prepared with placeholders');

    // Set the template variables
    doc.setData(templateData);

    // Try to render the document
    try {
      doc.render();
    } catch (error: any) {
      console.error('Template rendering error:', error);

      // Log detailed error information
      if (error.properties && error.properties.errors) {
        error.properties.errors.forEach((err: any) => {
          console.error('Error details:', err);
        });
      }

      return NextResponse.json(
        {
          error: 'Template rendering failed',
          details: error.message || 'Unknown error',
          properties: error.properties,
        },
        { status: 400 }
      );
    }

    // Generate the output
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Create a safe filename
    const safeName = (data.employee_name || 'Contract')
      .replace(/[^a-zA-Z0-9ăâîșțĂÂÎȘȚ ]/g, '')
      .replace(/\s+/g, '_');

    // Return the document
    return new NextResponse(buffer as BodyInit | null | undefined, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Contract_${safeName}.docx"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating contract:', error);

    // Log stack trace for debugging
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to generate contract',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method to check if template exists
export async function GET() {
  try {
    const templatePath = path.join(
      process.cwd(),
      'public',
      'templates',
      'CIM_DRAFT_WITH_PLACEHOLDERS.docx'
    );
    const exists = fs.existsSync(templatePath);

    if (exists) {
      const stats = fs.statSync(templatePath);
      return NextResponse.json({
        status: 'ready',
        templateName: 'CIM_DRAFT_WITH_PLACEHOLDERS.docx',
        templateSize: `${(stats.size / 1024).toFixed(2)} KB`,
        lastModified: stats.mtime,
        message: 'Template found and ready for use',
        note: 'All placeholders are optional - unfilled placeholders will be empty',
        placeholders: [
          'contract_number',
          'contract_registration_date',
          'company_name',
          'company_city',
          'company_street',
          'company_building',
          'company_apartment',
          'company_county',
          'company_fiscal_code',
          'company_representative',
          'employee_name',
          'employee_city',
          'employee_street',
          'employee_number',
          'employee_building',
          'employee_apartment',
          'employee_county',
          'employee_residence_permit',
          'employee_residence_issued_by',
          'employee_residence_issued_date',
          'employee_cnp',
          'contract_start_date',
          'probation_conditions',
          'workplace',
          'workplace_alternative',
          'workplace_area',
          'workplace_benefits',
          'workplace_supplements',
          'workplace_transport',
          'shift_schedule',
          'vacation_days',
          'salary_allowances',
          'salary_supplements_cash',
          'salary_supplements_kind',
          'salary_other_additions',
          'overtime_rate',
          'payment_date',
          'payment_method',
          'dismissal_notice',
          'resignation_notice',
          'other_clauses',
          'digital_signature_usage',
          'professional_training',
          'personal_protective_equipment',
          'work_equipment',
          'hygiene_materials',
          'protective_nutrition',
          'other_health_safety',
          'collective_agreement_level',
        ],
      });
    } else {
      return NextResponse.json({
        status: 'missing_template',
        message:
          'Template file not found. Please upload CIM_DRAFT_WITH_PLACEHOLDERS.docx to public/templates/',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
