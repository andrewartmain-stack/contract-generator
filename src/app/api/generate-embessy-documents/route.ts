// app/api/generate-embessy-documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { company, employees } = data;

    console.log(
      'Generating embassy documents for employees:',
      employees.length,
    );

    // Template file names for embassy documents (все Word файлы)
    const templates = [
      'Embessy_COMODAT_WITH_PLACEHOLDERS.docx',
      'Embessy_GARANTIE_WITH_PLACEHOLDERS.docx',
      'Embessy_ADEVERINTA_WITH_PLACEHOLDERS.docx',
      'Embasyy_CIM_WITH_PLACEHOLDERS.docx', // Word документ
    ];

    // Create JSZip instance
    const zip = new JSZip();

    // Process each employee
    for (const employee of employees) {
      const employeeName = employee.employee_name_worker_field || 'Angajat';
      const safeFolderName = employeeName
        .replace(/[^a-zA-Z0-9ăâîșțĂÂÎȘȚ ]/g, '')
        .replace(/\s+/g, '_');

      // Create folder for employee
      const employeeFolder = zip.folder(safeFolderName);

      // Process each template
      for (const templateName of templates) {
        const templatePath = path.join(
          process.cwd(),
          'public',
          'templates',
          templateName,
        );

        // Check if template exists
        if (!fs.existsSync(templatePath)) {
          console.error(`Template not found: ${templateName}`);
          continue;
        }

        // Prepare template data
        const templateData = {
          // Company fields
          company_name_company_field: company.company_name_company_field || '',
          company_fiscal_code_company_field:
            company.company_fiscal_code_company_field || '',
          company_address_company_field:
            company.company_address_company_field || '',
          company_registrul_comertului_company_field:
            company.company_registrul_comertului_company_field || '',
          company_owner_company_field:
            company.company_owner_company_field || '',

          // Employee fields
          employee_name_worker_field: employee.employee_name_worker_field || '',
          employee_address_worker_field:
            employee.employee_address_worker_field || '',
          document_cnp_worker_field: employee.document_cnp_worker_field || '',
          country_worker_field: employee.country_worker_field || '',
          employee_dob_worker_field: employee.employee_dob_worker_field || '',
          document_seria_number_worker_field:
            employee.document_seria_number_worker_field || '',
          issued_by_worker_field: employee.issued_by_worker_field || '',
          work_permit_worker_field: employee.work_permit_worker_field || '',
          permit_issued_worker_field: employee.permit_issued_worker_field || '',
          activity_start_worker_field:
            employee.activity_start_worker_field || '',
          contract_number_worker_field:
            employee.contract_number_worker_field || '',
          contract_creation_date_worker_field:
            employee.contract_creation_date_worker_field || '',
          salary_worker_field: employee.salary_worker_field || '4050lei/900E',
          cor_worker_field: employee.cor_worker_field || 'cor 962101',
          worker_position_worker_field:
            employee.worker_position_worker_field || 'COURIER',
          comodant_worker_field:
            employee.comodant_worker_field || 'Alazem Muhamed Anas',
          comodant_address_worker_field:
            employee.comodant_address_worker_field || '',
          comodant_cnp_worker_field:
            employee.comodant_cnp_worker_field || '19508094200115',
          comodant_end_worker_field: employee.comodant_end_worker_field || '',
        };

        try {
          // Process Word document
          const content = fs.readFileSync(templatePath, 'binary');
          const zipTemplate = new PizZip(content);

          const doc = new Docxtemplater(zipTemplate, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: {
              start: '{{',
              end: '}}',
            },
          });

          doc.setData(templateData);
          doc.render();

          const buffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
          });

          const outputFileName = getOutputFileName(templateName, employeeName);
          employeeFolder?.file(outputFileName, buffer);
        } catch (error: any) {
          console.error(
            `Error rendering template ${templateName} for ${employeeName}:`,
            error,
          );
          continue;
        }
      }

      // Process photo if exists
      if (employee.photo_base64) {
        try {
          // Convert base64 image to PDF
          const pdfBytes = await convertImageToPDF(employee.photo_base64);

          // Create PDF file name
          const photoFileName = `Document_Foto_${safeFolderName}.pdf`;
          employeeFolder?.file(photoFileName, pdfBytes);

          console.log(`Photo PDF created for ${employeeName}`);
        } catch (photoError) {
          console.error(
            `Error creating photo PDF for ${employeeName}:`,
            photoError,
          );
        }
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Return ZIP file
    const fileName =
      employees.length === 1
        ? `${employees[0].employee_name_worker_field.replace(/\s+/g, '_')}_Documente_Ambasada.zip`
        : `Documente_Ambasada_${new Date().toISOString().split('T')[0]}.zip`;

    return new NextResponse(zipBuffer as BodyInit | null | undefined, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating embassy documents:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate documents',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

// Helper function to generate output file names
function getOutputFileName(templateName: string, employeeName: string): string {
  const safeName = employeeName
    .replace(/[^a-zA-Z0-9ăâîșțĂÂÎȘȚ ]/g, '')
    .replace(/\s+/g, '_');

  const baseNames: Record<string, string> = {
    'Embessy_COMODAT_WITH_PLACEHOLDERS.docx': `Contract_Comodat_${safeName}.docx`,
    'Embessy_GARANTIE_WITH_PLACEHOLDERS.docx': `Scrisoare_Garantie_${safeName}.docx`,
    'Embessy_ADEVERINTA_WITH_PLACEHOLDERS.docx': `Adeverinta_${safeName}.docx`,
    'Embasyy_CIM_WITH_PLACEHOLDERS.docx': `Contract_Munca_${safeName}.docx`, // Оставляем как DOCX
  };

  return baseNames[templateName] || `Document_${safeName}.docx`;
}

// Helper function to convert image to PDF using pdf-lib
async function convertImageToPDF(base64Image: string): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const imageBytes = Buffer.from(base64Image, 'base64');

    let image;
    const firstBytes = imageBytes.slice(0, 4);
    const firstBytesHex = Array.from(firstBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (firstBytesHex.startsWith('ffd8')) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (firstBytesHex.startsWith('89504e47')) {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      image = await pdfDoc.embedJpg(imageBytes);
    }

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = image.scale(1);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    const margin = 50;
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;

    let scaledWidth = width;
    let scaledHeight = height;

    if (scaledWidth > maxWidth) {
      const scale = maxWidth / scaledWidth;
      scaledWidth *= scale;
      scaledHeight *= scale;
    }

    if (scaledHeight > maxHeight) {
      const scale = maxHeight / scaledHeight;
      scaledWidth *= scale;
      scaledHeight *= scale;
    }

    const x = (pageWidth - scaledWidth) / 2;
    const y = (pageHeight - scaledHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error converting image to PDF:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    const requiredTemplates = [
      'Embessy_COMODAT_WITH_PLACEHOLDERS.docx',
      'Embessy_GARANTIE_WITH_PLACEHOLDERS.docx',
      'Embessy_ADEVERINTA_WITH_PLACEHOLDERS.docx',
      'Embasyy_CIM_WITH_PLACEHOLDERS.docx',
    ];

    const availableTemplates = [];
    const missingTemplates = [];

    for (const template of requiredTemplates) {
      const templatePath = path.join(templatesDir, template);
      if (fs.existsSync(templatePath)) {
        const stats = fs.statSync(templatePath);
        availableTemplates.push({
          name: template,
          size: `${(stats.size / 1024).toFixed(2)} KB`,
          lastModified: stats.mtime,
          type: 'Word',
        });
      } else {
        missingTemplates.push(template);
      }
    }

    return NextResponse.json({
      status:
        availableTemplates.length === requiredTemplates.length
          ? 'ready'
          : 'partial',
      availableTemplates,
      missingTemplates,
      totalRequired: requiredTemplates.length,
      available: availableTemplates.length,
      features: {
        photoToPdf: true,
        maxPhotoSize: '5MB',
        supportedImageFormats: ['JPEG', 'PNG'],
        outputPdfName: 'Document_Foto_[nume].pdf',
        totalDocuments: requiredTemplates.length + 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 500 },
    );
  }
}
