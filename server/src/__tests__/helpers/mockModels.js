// Mocks pour les modèles Sequelize

export const mockReleve = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  sum: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

export const mockCompteur = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
};

export const mockUser = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
};

// Fonction pour réinitialiser tous les mocks
export const resetAllMocks = () => {
  Object.values(mockReleve).forEach(mock => {
    if (typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
  Object.values(mockCompteur).forEach(mock => {
    if (typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
  Object.values(mockUser).forEach(mock => {
    if (typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
};

// Données de test réutilisables
export const mockData = {
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
  releve: {
    id: 1,
    compteur_id: 'COMP-2025-001',
    agent_id: 1,
    index_actuel: 1500,
    index_precedent: 1000,
    consommation: 500,
    date_heure: new Date('2025-01-15'),
    anomalie: false,
    commentaire: null,
    latitude: 48.8566,
    longitude: 2.3522,
  },
  releve2: {
    id: 2,
    compteur_id: 'COMP-2025-001',
    agent_id: 1,
    index_actuel: 2000,
    index_precedent: 1500,
    consommation: 500,
    date_heure: new Date('2025-02-15'),
    anomalie: false,
    commentaire: null,
    latitude: 48.8566,
    longitude: 2.3522,
  },
};

// Mock de la réponse HTTP
export const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock de la requête HTTP
export const mockRequest = (data = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    user: data.user || { id: 1, role: 'AGENT' },
  };
};
