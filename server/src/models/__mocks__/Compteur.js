import { jest } from '@jest/globals';

const mockCompteur = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
};

export default mockCompteur;
