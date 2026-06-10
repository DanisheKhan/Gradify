import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Clean up stylesheet content in cloned document to prevent html2canvas oklab/oklch parser crashes.
 */
const sanitizeClonedDocument = (clonedDoc) => {
  try {
    // 1. Sanitize style tags
    clonedDoc.querySelectorAll('style').forEach((styleEl) => {
      let cssText = styleEl.textContent;
      if (cssText.includes('oklab') || cssText.includes('oklch')) {
        // Replace oklab(...) and oklch(...) functions with a safe fallback color
        cssText = cssText.replace(/oklab\([^)]+\)/g, 'rgb(80, 80, 80)');
        cssText = cssText.replace(/oklch\([^)]+\)/g, 'rgb(80, 80, 80)');
        styleEl.textContent = cssText;
      }
    });

    // 2. Safely clean up styleSheets rules
    Array.from(clonedDoc.styleSheets).forEach((sheet) => {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) return;
        for (let i = rules.length - 1; i >= 0; i--) {
          const rule = rules[i];
          if (rule.cssText && (rule.cssText.includes('oklab') || rule.cssText.includes('oklch'))) {
            sheet.deleteRule(i);
          }
        }
      } catch (e) {
        // Catch cross-origin stylesheet errors silently
      }
    });
  } catch (error) {
    console.warn('Error sanitizing cloned document styles:', error);
  }
};

/**
 * Generates a clean 1-page PDF from a DOM element (Result Slip).
 */
export const generateSinglePagePDF = async (element, filename = 'result_slip.pdf') => {
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        sanitizeClonedDocument(clonedDoc);
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating single-page PDF:', error);
    throw error;
  }
};

/**
 * Generates a multi-page PDF from a parent container.
 * Each child element matching the selector will be captured as a separate page.
 */
export const generateMultiPagePDF = async (containerElement, childSelector = '.page-break-after', filename = 'booklet.pdf') => {
  if (!containerElement) return;

  try {
    const pages = containerElement.querySelectorAll(childSelector);
    if (pages.length === 0) {
      await generateSinglePagePDF(containerElement, filename);
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          sanitizeClonedDocument(clonedDoc);
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating multi-page PDF:', error);
    throw error;
  }
};

export default { generateSinglePagePDF, generateMultiPagePDF };
