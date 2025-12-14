import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Utilitaire pour générer des PDFs avec un header standardisé REE
 */

// Couleurs REE
const COLORS = {
    primary: [41, 128, 185],      // Bleu primary
    secondary: [52, 152, 219],    // Bleu clair
    dark: [44, 62, 80],           // Gris foncé
    light: [236, 240, 241],       // Gris clair
    success: [46, 204, 113],      // Vert
    danger: [231, 76, 60],        // Rouge
    warning: [241, 196, 15],      // Jaune
};

/**
 * Ajoute le header REE standard à chaque page
 */
export const addHeader = (doc, title) => {
    const pageWidth = doc.internal.pageSize.width;

    // Fond bleu pour le header
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Logo/Titre REE
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Rabat Energie & Eau', 15, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SI Relevés - Système de Gestion des Compteurs', 15, 23);

    // Titre du rapport
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, 35, pageWidth, 15, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, 45);

    // Date de génération
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Généré le ${dateStr}`, pageWidth - 15, 45, { align: 'right' });

    return 55; // Position Y après le header
};

/**
 * Ajoute le footer avec numéro de page
 */
export const addFooter = (doc, pageNumber) => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFillColor(...COLORS.light);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
        `Page ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 7,
        { align: 'center' }
    );

    doc.text(
        '© Rabat Energie & Eau - Confidentiel',
        15,
        pageHeight - 7
    );
};

/**
 * Crée un nouveau document PDF avec header et footer
 */
export const createPDF = (title) => {
    const doc = new jsPDF();
    const startY = addHeader(doc, title);
    addFooter(doc, 1);

    return { doc, startY };
};

/**
 * Ajoute une section avec titre
 */
export const addSection = (doc, title, y) => {
    doc.setFillColor(...COLORS.light);
    doc.rect(10, y, doc.internal.pageSize.width - 20, 10, 'F');

    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, y + 7);

    return y + 15; // Position Y après la section
};

/**
 * Ajoute une KPI card
 */
export const addKPI = (doc, x, y, label, value, unit = '', color = COLORS.primary) => {
    const cardWidth = 55;
    const cardHeight = 30;

    // Bordure
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'S');

    // Label
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + cardWidth / 2, y + 8, { align: 'center' });

    // Valeur
    doc.setTextColor(...color);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${value}${unit}`, x + cardWidth / 2, y + 20, { align: 'center' });

    return y + cardHeight + 5;
};

/**
 * Sauvegarde le PDF
 */
export const savePDF = (doc, filename) => {
    doc.save(filename);
};
