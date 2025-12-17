import { jest } from '@jest/globals';

const mockUser = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
};

export default mockUser;
