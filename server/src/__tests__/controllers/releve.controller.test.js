import { jest } from '@jest/globals';

// Mock avant import
jest.unstable_mockModule('../../models/Releve.js', () => ({
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    sum: jest.fn(),
  },
}));

jest.unstable_mockModule('../../models/Compteur.js', () => ({
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../../models/User.js', () => ({
  default: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule('sequelize', () => ({
  Op: {},
}));

// Imports dynamiques APRÈS les mocks
const { createReleve, updateReleve } = await import('../../controllers/releve.controller.js');
const Releve = (await import('../../models/Releve.js')).default;
const Compteur = (await import('../../models/Compteur.js')).default;
const User = (await import('../../models/User.js')).default;

// Helpers
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (data = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    user: data.user || { id: 1, role: 'AGENT' },
  };
};

const mockData = {
  compteur: {
    id_compteur: 'COMP-2025-001',
    type_fluide: 'EAU',
    adresse: '123 Rue Test',
    quartier: 'Centre-ville',
    actif: true,
  },
  agent: {
    id: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'agent@test.com',
    role: 'AGENT',
  },
};

describe('Releve Controller - Calcul de Consommation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReleve - Calcul de consommation', () => {
    test('devrait calculer la consommation correctement avec un relevé précédent', async () => {
      const req = mockRequest({
        body: {
          compteur_id: 'COMP-2025-001',
          agent_id: 1,
          index_actuel: 1500,
          date_heure: new Date('2025-01-15'),
        },
      });
      const res = mockResponse();

      Compteur.findOne.mockResolvedValue(mockData.compteur);
      User.findByPk.mockResolvedValue(mockData.agent);
      Releve.findOne.mockResolvedValue({
        id: 1,
        index_actuel: 1000,
        compteur_id: 'COMP-2025-001',
      });

      const nouveauReleve = {
        id: 2,
        compteur_id: 'COMP-2025-001',
        agent_id: 1,
        index_actuel: 1500,
        index_precedent: 1000,
        consommation: 500,
        date_heure: new Date('2025-01-15'),
      };
      Releve.create.mockResolvedValue(nouveauReleve);
      Releve.findByPk.mockResolvedValue({
        ...nouveauReleve,
        compteur: mockData.compteur,
        agent: mockData.agent,
      });

      await createReleve(req, res);

      expect(Releve.create).toHaveBeenCalledWith(
        expect.objectContaining({
          index_actuel: 1500,
          index_precedent: 1000,
          consommation: 500,
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Relevé créé avec succès',
        })
      );
    });

    test('devrait utiliser index_precedent = 0 pour le premier relevé', async () => {
      const req = mockRequest({
        body: {
          compteur_id: 'COMP-2025-001',
          agent_id: 1,
          index_actuel: 1200,
        },
      });
      const res = mockResponse();

      Compteur.findOne.mockResolvedValue(mockData.compteur);
      User.findByPk.mockResolvedValue(mockData.agent);
      Releve.findOne.mockResolvedValue(null);

      const nouveauReleve = {
        id: 1,
        compteur_id: 'COMP-2025-001',
        agent_id: 1,
        index_actuel: 1200,
        index_precedent: 0,
        consommation: 1200,
      };
      Releve.create.mockResolvedValue(nouveauReleve);
      Releve.findByPk.mockResolvedValue({
        ...nouveauReleve,
        compteur: mockData.compteur,
        agent: mockData.agent,
      });

      await createReleve(req, res);

      expect(Releve.create).toHaveBeenCalledWith(
        expect.objectContaining({
          index_actuel: 1200,
          index_precedent: 0,
          consommation: 1200,
        })
      );
    });

    test('devrait mettre consommation à 0 si index négatif', async () => {
      const req = mockRequest({
        body: {
          compteur_id: 'COMP-2025-001',
          agent_id: 1,
          index_actuel: 800,
        },
      });
      const res = mockResponse();

      Compteur.findOne.mockResolvedValue(mockData.compteur);
      User.findByPk.mockResolvedValue(mockData.agent);
      Releve.findOne.mockResolvedValue({ id: 1, index_actuel: 1000 });

      const nouveauReleve = {
        id: 2,
        index_actuel: 800,
        index_precedent: 1000,
        consommation: 0,
      };
      Releve.create.mockResolvedValue(nouveauReleve);
      Releve.findByPk.mockResolvedValue({
        ...nouveauReleve,
        compteur: mockData.compteur,
        agent: mockData.agent,
      });

      await createReleve(req, res);

      expect(Releve.create).toHaveBeenCalledWith(
        expect.objectContaining({
          consommation: 0,
        })
      );
    });

    test('devrait retourner 404 si compteur non trouvé', async () => {
      const req = mockRequest({
        body: {
          compteur_id: 'COMP-INEXISTANT',
          agent_id: 1,
          index_actuel: 1500,
        },
      });
      const res = mockResponse();

      Compteur.findOne.mockResolvedValue(null);

      await createReleve(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Compteur non trouvé',
      });
    });

    test('devrait retourner 404 si agent non trouvé', async () => {
      const req = mockRequest({
        body: {
          compteur_id: 'COMP-2025-001',
          agent_id: 999,
          index_actuel: 1500,
        },
      });
      const res = mockResponse();

      Compteur.findOne.mockResolvedValue(mockData.compteur);
      User.findByPk.mockResolvedValue(null);

      await createReleve(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateReleve', () => {
    test('devrait recalculer lors de la mise à jour', async () => {
      const req = mockRequest({
        params: { id: 1 },
        body: { index_actuel: 1800 },
      });
      const res = mockResponse();

      const releveExistant = {
        id: 1,
        index_actuel: 1500,
        index_precedent: 1000,
        consommation: 500,
        update: jest.fn(),
      };

      Releve.findByPk.mockResolvedValueOnce(releveExistant);
      Releve.findByPk.mockResolvedValueOnce({
        id: 1,
        index_actuel: 1800,
        consommation: 800,
        compteur: mockData.compteur,
        agent: mockData.agent,
      });

      await updateReleve(req, res);

      expect(releveExistant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          index_actuel: 1800,
          consommation: 800,
        })
      );
    });
  });
});
