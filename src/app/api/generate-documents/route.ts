import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    // Parse request data
    const data = await request.json();
    const { company, employees } = data;

    console.log('Generating documents for employees:', employees.length);

    // Template file names (добавили GDPR документ)
    const templates = [
      'Fisa_de_post_curier_WITH_PLACEHOLDERS.docx',
      'CIM_DRAFT_WITH_PLACEHOLDERS.docx',
      'cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx',
      'cerere_concediu_de_odihna_model_WITH_PLACEHOLDERS.docx',
      'GDPR_WITH_PLACEHOLDERS.docx', // Добавлен новый документ
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

        // Read the template
        const content = fs.readFileSync(templatePath, 'binary');
        const zipTemplate = new PizZip(content);

        // Initialize docxtemplater
        const doc = new Docxtemplater(zipTemplate, {
          paragraphLoop: true,
          linebreaks: true,
          delimiters: {
            start: '{{',
            end: '}}',
          },
        });

        // Prepare template data
        const templateData = {
          // Company fields
          company_name_company_field: company.company_name_company_field || '',
          company_fiscal_code_company_field:
            company.company_fiscal_code_company_field || '',
          company_address_company_field:
            company.company_address_company_field || '',
          company_owner_company_field:
            company.company_owner_company_field || '',

          // Worker fields
          contract_number_worker_field:
            employee.contract_number_worker_field || '',
          starting_date_worker_field: employee.starting_date_worker_field || '',
          employee_name_worker_field: employee.employee_name_worker_field || '',
          employee_address_worker_field:
            employee.employee_address_worker_field || '',
          type_of_document_worker_field:
            employee.type_of_document_worker_field || 'permisului de sedere',
          document_seria_number_worker_field:
            employee.document_seria_number_worker_field || '',
          document_given_by_worker_field:
            employee.document_given_by_worker_field || '',
          document_creation_date_worker_field:
            employee.document_creation_date_worker_field || '',
          document_cnp_worker_field: employee.document_cnp_worker_field || '',
          salary_worker_field: employee.salary_worker_field || '4050',
          cor_worker_field: employee.cor_worker_field || 'cor 962101',
          worker_position_worker_field:
            employee.worker_position_worker_field || 'CURIER',
        };

        try {
          // Set data and render
          doc.setData(templateData);
          doc.render();
        } catch (error: any) {
          console.error(
            `Error rendering template ${templateName} for ${employeeName}:`,
            error,
          );
          continue;
        }

        // Generate output buffer
        const buffer = doc.getZip().generate({
          type: 'nodebuffer',
          compression: 'DEFLATE',
        });

        // Add file to employee folder
        const outputFileName = getOutputFileName(templateName, employeeName);
        employeeFolder?.file(outputFileName, buffer);
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
        ? `${employees[0].employee_name_worker_field.replace(/\s+/g, '_')}_Documente.zip`
        : `Documente_Angajati_${new Date().toISOString().split('T')[0]}.zip`;

    return new NextResponse(zipBuffer as BodyInit | null | undefined, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating documents:', error);

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

// Helper function to generate output file names (добавили GDPR)
function getOutputFileName(templateName: string, employeeName: string): string {
  const safeName = employeeName
    .replace(/[^a-zA-Z0-9ăâîșțĂÂÎȘȚ ]/g, '')
    .replace(/\s+/g, '_');

  const baseNames: Record<string, string> = {
    'Fisa_de_post_curier_WITH_PLACEHOLDERS.docx': `Fisa_post_${safeName}.docx`,
    'CIM_DRAFT_WITH_PLACEHOLDERS.docx': `Contract_munca_${safeName}.docx`,
    'cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx': `Cerere_incetare_${safeName}.docx`,
    'cerere_concediu_de_odihna_model_WITH_PLACEHOLDERS.docx': `Cerere_concediu_${safeName}.docx`,
    'GDPR_WITH_PLACEHOLDERS.docx': `GDPR_${safeName}.docx`, // Новый документ
  };

  return baseNames[templateName] || `Document_${safeName}.docx`;
}

// Helper function to convert image to PDF using pdf-lib (без водяного знака)
async function convertImageToPDF(base64Image: string): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Decode base64 image
    const imageBytes = Buffer.from(base64Image, 'base64');

    // Try to determine image type
    let image;
    const firstBytes = imageBytes.slice(0, 4);
    const firstBytesHex = Array.from(firstBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Check image type based on magic bytes
    if (firstBytesHex.startsWith('ffd8')) {
      // JPEG
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (firstBytesHex.startsWith('89504e47')) {
      // PNG
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      // Default to JPEG if unknown
      image = await pdfDoc.embedJpg(imageBytes);
    }

    // Add a page (A4 size: 595.28 x 841.89 points)
    const page = pdfDoc.addPage([595.28, 841.89]);

    // Calculate image dimensions to fit page
    const { width, height } = image.scale(1);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Center image on page with margins
    const margin = 50;
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;

    let scaledWidth = width;
    let scaledHeight = height;

    // Scale down if too large
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

    // Center image
    const x = (pageWidth - scaledWidth) / 2;
    const y = (pageHeight - scaledHeight) / 2;

    // Draw image on page
    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error converting image to PDF:', error);
    throw error;
  }
}

// GET method to check available templates (обновили список)
export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    const requiredTemplates = [
      'Fisa_de_post_curier_WITH_PLACEHOLDERS.docx',
      'CIM_DRAFT_WITH_PLACEHOLDERS.docx',
      'cerere_incetare_cim_art_55_b_MXA_WITH_PLACEHOLDERS.docx',
      'cerere_concediu_de_odihna_model_WITH_PLACEHOLDERS.docx',
      'GDPR_WITH_PLACEHOLDERS.docx', // Добавлен новый документ
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
        totalDocuments: requiredTemplates.length + 1, // +1 для фотографии
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
