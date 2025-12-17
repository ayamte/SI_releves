import { jest } from '@jest/globals';

// Mock avant import
jest.unstable_mockModule('../../models/Releve.js', () => ({
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    sum: jest.fn(),
  },
}));

jest.unstable_mockModule('../../models/Compteur.js', () => ({ default: {} }));
jest.unstable_mockModule('../../models/User.js', () => ({ default: {} }));
jest.unstable_mockModule('sequelize', () => ({ Op: {} }));

// Imports dynamiques
const { getRelevesStats, getAllReleves, getReleveById, deleteReleve } = await import('../../controllers/releve.controller.js');
const Releve = (await import('../../models/Releve.js')).default;

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

describe('Releve Controller - Statistiques', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRelevesStats', () => {
    test('devrait calculer les statistiques correctement', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Releve.count.mockResolvedValueOnce(100);
      Releve.count.mockResolvedValueOnce(15);
      Releve.sum.mockResolvedValue(50000);

      await getRelevesStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        total: 100,
        anomalies: 15,
        consommation_totale: '50000.00',
        consommation_moyenne: '500.00',
      });
    });

    test('devrait gérer le cas sans relevés', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Releve.count.mockResolvedValueOnce(0);
      Releve.count.mockResolvedValueOnce(0);
      Releve.sum.mockResolvedValue(null);

      await getRelevesStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        total: 0,
        anomalies: 0,
        consommation_totale: '0.00',
        consommation_moyenne: '0.00',
      });
    });

    test('devrait arrondir à 2 décimales', async () => {
      const req = mockRequest();
      const res = mockResponse();

      Releve.count.mockResolvedValueOnce(3);
      Releve.count.mockResolvedValueOnce(0);
      Releve.sum.mockResolvedValue(1000.789);

      await getRelevesStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        total: 3,
        anomalies: 0,
        consommation_totale: '1000.79',
        consommation_moyenne: '333.60',
      });
    });
  });

  describe('getAllReleves', () => {
    test('devrait récupérer tous les relevés', async () => {
      const req = mockRequest({ query: {} });
      const res = mockResponse();

      const mockReleves = [
        { id: 1, consommation: 500 },
        { id: 2, consommation: 300 },
      ];

      Releve.findAll.mockResolvedValue(mockReleves);

      await getAllReleves(req, res);

      expect(Releve.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockReleves);
    });
  });

  describe('getReleveById', () => {
    test('devrait récupérer un relevé par ID', async () => {
      const req = mockRequest({ params: { id: 1 } });
      const res = mockResponse();

      const mockReleve = { id: 1, consommation: 500 };
      Releve.findByPk.mockResolvedValue(mockReleve);

      await getReleveById(req, res);

      expect(res.json).toHaveBeenCalledWith(mockReleve);
    });

    test('devrait retourner 404 si non trouvé', async () => {
      const req = mockRequest({ params: { id: 999 } });
      const res = mockResponse();

      Releve.findByPk.mockResolvedValue(null);

      await getReleveById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Relevé non trouvé',
      });
    });
  });

  describe('deleteReleve', () => {
    test('devrait supprimer un relevé', async () => {
      const req = mockRequest({ params: { id: 1 } });
      const res = mockResponse();

      const mockReleve = {
        id: 1,
        destroy: jest.fn(),
      };

      Releve.findByPk.mockResolvedValue(mockReleve);

      await deleteReleve(req, res);

      expect(mockReleve.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Relevé supprimé avec succès',
      });
    });
  });
});
