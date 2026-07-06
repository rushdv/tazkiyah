import { habitRepository } from '../repositories/habit.repository';

export const habitService = {
  async getAll() {
    return habitRepository.findAll();
  },
};
