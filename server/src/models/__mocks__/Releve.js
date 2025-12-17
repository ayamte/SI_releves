import { jest } from '@jest/globals';

const mockReleve = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  sum: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

export default mockReleve;
