import { createPDF, addSection, addKPI, savePDF } from '../pdfGenerator';
import { Chart } from 'chart.js/auto';

/**
 * Génère un graphique Chart.js et le convertit en image pour le PDF
 */
const generateChartImage = async (chartConfig) => {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1200;
            canvas.height = 600;

            // Ajouter le canvas au DOM temporairement pour le rendu
            canvas.style.position = 'absolute';
            canvas.style.left = '-9999px';
            document.body.appendChild(canvas);

            const chart = new Chart(canvas, chartConfig);

            // Attendre que le graphique soit complètement rendu
            setTimeout(() => {
                try {
                    const imageData = canvas.toDataURL('image/png', 1.0);
                    chart.destroy();
                    document.body.removeChild(canvas);

                    // Vérifier que l'image est valide
                    if (imageData && imageData.startsWith('data:image/png')) {
                        resolve(imageData);
                    } else {
                        reject(new Error('Image PNG invalide'));
                    }
                } catch (error) {
                    document.body.removeChild(canvas);
                    reject(error);
                }
            }, 1000);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Génère le rapport d'évolution de consommation
 * Contient: Consommation eau/électricité, évolution mensuelle, comparaisons
 */
export const generateRapportConsommation = async (releves, compteurs) => {
    const { doc, startY } = createPDF('Rapport d\'Évolution de la Consommation');
    let yPos = startY + 5;

    // === SECTION 1: KPIs Consommation ===
    yPos = addSection(doc, '📊 Consommation Globale', yPos);

    // Calculer les consommations par type
    const relevesEau = releves.filter(r => {
        const compteur = compteurs.find(c => c.id_compteur === r.compteur_id);
        return compteur?.type_fluide === 'EAU';
    });

    const relevesElec = releves.filter(r => {
        const compteur = compteurs.find(c => c.id_compteur === r.compteur_id);
        return compteur?.type_fluide === 'ELEC';
    });

    const totalEau = relevesEau.reduce((sum, r) => sum + r.consommation, 0);
    const totalElec = relevesElec.reduce((sum, r) => sum + r.consommation, 0);
    const moyenneEau = relevesEau.length > 0 ? (totalEau / relevesEau.length).toFixed(1) : 0;
    const moyenneElec = relevesElec.length > 0 ? (totalElec / relevesElec.length).toFixed(1) : 0;

    // Afficher les KPIs
    const kpiY = yPos;
    addKPI(doc, 15, kpiY, 'Total Eau', totalEau.toFixed(0), ' m³', [52, 152, 219]);
    addKPI(doc, 75, kpiY, 'Total Électricité', totalElec.toFixed(0), ' kWh', [241, 196, 15]);
    addKPI(doc, 135, kpiY, 'Moyenne Eau', moyenneEau, ' m³', [52, 152, 219]);

    yPos = kpiY + 40;

    const kpiY2 = yPos;
    addKPI(doc, 15, kpiY2, 'Moyenne Électricité', moyenneElec, ' kWh', [241, 196, 15]);
    addKPI(doc, 75, kpiY2, 'Relevés Eau', relevesEau.length, '', [52, 152, 219]);
    addKPI(doc, 135, kpiY2, 'Relevés Électricité', relevesElec.length, '', [241, 196, 15]);

    yPos = kpiY2 + 45;

    // === SECTION 2: Évolution Mensuelle ===
    yPos = addSection(doc, '📈 Évolution Mensuelle de la Consommation', yPos);

    // Grouper par mois
    const relevesParMois = releves.reduce((acc, releve) => {
        const date = new Date(releve.date_heure);
        const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!acc[mois]) {
            acc[mois] = { eau: [], elec: [] };
        }

        const compteur = compteurs.find(c => c.id_compteur === releve.compteur_id);
        if (compteur?.type_fluide === 'EAU') {
            acc[mois].eau.push(releve.consommation);
        } else if (compteur?.type_fluide === 'ELEC') {
            acc[mois].elec.push(releve.consommation);
        }

        return acc;
    }, {});

    // Trier par mois
    const moisTries = Object.keys(relevesParMois).sort();
    const labels = moisTries.map(m => {
        const [annee, mois] = m.split('-');
        return new Date(annee, mois - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    });

    const dataEau = moisTries.map(m => {
        const consommations = relevesParMois[m].eau;
        return consommations.length > 0
            ? consommations.reduce((sum, c) => sum + c, 0) / consommations.length
            : 0;
    });

    const dataElec = moisTries.map(m => {
        const consommations = relevesParMois[m].elec;
        return consommations.length > 0
            ? consommations.reduce((sum, c) => sum + c, 0) / consommations.length
            : 0;
    });

    // Générer le graphique
    const chartImage = await generateChartImage({
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Eau (m³)',
                    data: dataEau,
                    borderColor: 'rgb(52, 152, 219)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Électricité (kWh)',
                    data: dataElec,
                    borderColor: 'rgb(241, 196, 15)',
                    backgroundColor: 'rgba(241, 196, 15, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Consommation Moyenne Mensuelle',
                    font: { size: 16 }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Consommation Moyenne'
                    }
                }
            }
        }
    });

    // Ajouter le graphique au PDF
    doc.addImage(chartImage, 'PNG', 15, yPos, 180, 90);
    yPos += 95;

    // === SECTION 3: Tableau Détaillé ===
    yPos = addSection(doc, '📋 Détails Mensuels', yPos);

    const tableData = moisTries.map(m => {
        const eauData = relevesParMois[m].eau;
        const elecData = relevesParMois[m].elec;

        return [
            labels[moisTries.indexOf(m)],
            eauData.length,
            eauData.length > 0 ? (eauData.reduce((s, c) => s + c, 0) / eauData.length).toFixed(1) : '0',
            elecData.length,
            elecData.length > 0 ? (elecData.reduce((s, c) => s + c, 0) / elecData.length).toFixed(1) : '0'
        ];
    });

    doc.autoTable({
        startY: yPos,
        head: [['Mois', 'Relevés Eau', 'Moy Eau (m³)', 'Relevés Élec', 'Moy Élec (kWh)']],
        body: tableData,
        headStyles: {
            fillColor: [41, 128, 185],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 38 },
            1: { halign: 'center', cellWidth: 28 },
            2: { halign: 'center', cellWidth: 32 },
            3: { halign: 'center', cellWidth: 28 },
            4: { halign: 'center', cellWidth: 38 }
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto'
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // === SECTION 4: Analyse et Recommandations ===
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    yPos = addSection(doc, '💡 Analyse et Recommandations', yPos);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);

    // Calculer les tendances
    const tendanceEau = dataEau.length > 1
        ? ((dataEau[dataEau.length - 1] - dataEau[0]) / dataEau[0] * 100).toFixed(1)
        : 0;

    const tendanceElec = dataElec.length > 1
        ? ((dataElec[dataElec.length - 1] - dataElec[0]) / dataElec[0] * 100).toFixed(1)
        : 0;

    const analyses = [
        `• Tendance Eau: ${tendanceEau > 0 ? '+' : ''}${tendanceEau}% sur la période`,
        `• Tendance Électricité: ${tendanceElec > 0 ? '+' : ''}${tendanceElec}% sur la période`,
        `• Consommation moyenne eau par relevé: ${moyenneEau} m³`,
        `• Consommation moyenne électricité par relevé: ${moyenneElec} kWh`,
        `• ${Math.abs(tendanceEau) > 15 || Math.abs(tendanceElec) > 15 ? 'Variation importante détectée - enquête recommandée' : 'Évolution normale de la consommation'}`
    ];

    analyses.forEach((analyse, idx) => {
        doc.text(analyse, 20, yPos + (idx * 7));
    });

    // Sauvegarder le PDF
    const filename = `Rapport_Consommation_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
    savePDF(doc, filename);

    return filename;
};
