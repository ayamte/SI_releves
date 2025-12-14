import { createPDF, addSection, addKPI, savePDF } from '../pdfGenerator';

/**
 * Génère le rapport mensuel des relevés
 * Contient: Répartition agents/quartiers, stats par quartier, performance
 */
export const generateRapportMensuel = (releves, agents, compteurs, quartiers, adresses) => {
    const { doc, startY } = createPDF('Rapport Mensuel des Relevés');
    let yPos = startY + 5;

    // === SECTION 1: KPIs Globaux ===
    yPos = addSection(doc, '📊 Indicateurs Clés de Performance', yPos);

    const totalReleves = releves.length;
    const totalAgents = agents.length;
    const avgRelevesParAgent = (totalReleves / totalAgents).toFixed(1);
    const totalCompteurs = compteurs.length;
    const tauxCouverture = ((new Set(releves.map(r => r.compteur_id)).size / totalCompteurs) * 100).toFixed(1);

    // Afficher les KPIs en ligne
    const kpiY = yPos;
    addKPI(doc, 15, kpiY, 'Total Relevés', totalReleves, '', [41, 128, 185]);
    addKPI(doc, 75, kpiY, 'Relevés/Agent', avgRelevesParAgent, '', [52, 152, 219]);
    addKPI(doc, 135, kpiY, 'Taux Couverture', tauxCouverture, '%', [46, 204, 113]);

    yPos = kpiY + 40;

    // === SECTION 2: Répartition par Quartier ===
    yPos = addSection(doc, '🏘️ Répartition des Relevés par Quartier', yPos);

    // Calculer les stats par quartier
    const statsQuartiers = quartiers.map(quartier => {
        const compteursQuartier = compteurs.filter(c => {
            const adresse = adresses.find(a => a.id === c.adresse_id);
            return adresse?.quartier_id === quartier.id;
        });

        const relevesQuartier = releves.filter(r =>
            compteursQuartier.some(c => c.id_compteur === r.compteur_id)
        );

        const agentsQuartier = new Set(relevesQuartier.map(r => r.agent_id)).size;

        return {
            nom: quartier.nom_quartier,
            compteurs: compteursQuartier.length,
            releves: relevesQuartier.length,
            agents: agentsQuartier,
            avgParAgent: agentsQuartier > 0 ? (relevesQuartier.length / agentsQuartier).toFixed(1) : 0,
            taux: compteursQuartier.length > 0
                ? ((new Set(relevesQuartier.map(r => r.compteur_id)).size / compteursQuartier.length) * 100).toFixed(1)
                : 0
        };
    });

    // Tableau des quartiers
    doc.autoTable({
        startY: yPos,
        head: [['Quartier', 'Compteurs', 'Relevés', 'Agents', 'Moy/Agent', 'Taux %']],
        body: statsQuartiers.map(q => [
            q.nom,
            q.compteurs,
            q.releves,
            q.agents,
            q.avgParAgent,
            q.taux + '%'
        ]),
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
            0: { cellWidth: 50 },
            1: { halign: 'center', cellWidth: 23 },
            2: { halign: 'center', cellWidth: 23 },
            3: { halign: 'center', cellWidth: 23 },
            4: { halign: 'center', cellWidth: 25 },
            5: { halign: 'center', cellWidth: 23 }
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto'
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // === SECTION 3: Performance des Agents ===
    yPos = addSection(doc, '👥 Performance des Agents', yPos);

    // Calculer stats par agent
    const statsAgents = agents.map(agent => {
        const relevesAgent = releves.filter(r => r.agent_id === agent.id);
        const compteursAgent = new Set(relevesAgent.map(r => r.compteur_id)).size;

        return {
            nom: `${agent.prenom} ${agent.nom}`,
            releves: relevesAgent.length,
            compteurs: compteursAgent,
            moyJour: (relevesAgent.length / 30).toFixed(1) // Moyenne mensuelle / 30 jours
        };
    }).sort((a, b) => b.releves - a.releves); // Tri par nombre de relevés décroissant

    doc.autoTable({
        startY: yPos,
        head: [['Agent', 'Relevés Totaux', 'Compteurs Différents', 'Moy/Jour']],
        body: statsAgents.map(a => [
            a.nom,
            a.releves,
            a.compteurs,
            a.moyJour
        ]),
        headStyles: {
            fillColor: [52, 152, 219],
            fontSize: 9,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { halign: 'center', cellWidth: 35 },
            2: { halign: 'center', cellWidth: 42 },
            3: { halign: 'center', cellWidth: 30 }
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto'
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // === SECTION 4: Recommandations ===
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    yPos = addSection(doc, '💡 Recommandations', yPos);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);

    const recommendations = [
        `• Le taux de couverture global est de ${tauxCouverture}% - ${tauxCouverture < 80 ? 'nécessite amélioration' : 'bon niveau'}`,
        `• ${statsQuartiers.filter(q => q.taux < 70).length} quartier(s) sous 70% de couverture`,
        `• Agent le plus performant: ${statsAgents[0].nom} (${statsAgents[0].releves} relevés)`,
        `• Moyenne quotidienne par agent: ${(totalReleves / totalAgents / 30).toFixed(1)} relevés/jour`
    ];

    recommendations.forEach((rec, idx) => {
        doc.text(rec, 20, yPos + (idx * 7));
    });

    // Sauvegarder le PDF
    const filename = `Rapport_Mensuel_Releves_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
    savePDF(doc, filename);

    return filename;
};
