import { reflectionRepository } from '../repositories/reflection.repository';
import { ReflectionInput } from '@tazkiyah/shared';

export const reflectionService = {
  async upsertReflection(userId: string, input: ReflectionInput) {
    const date = new Date(input.date + 'T00:00:00Z');
    return reflectionRepository.upsert(userId, date, {
      mood: input.mood,
      notes: input.notes,
      improvement: input.improvement,
    });
  },

  async getReflectionByDate(userId: string, dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00Z');
    return reflectionRepository.findByUserAndDate(userId, date);
  },

  async getReflectionsForRange(userId: string, startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr + 'T00:00:00Z');
    const end = new Date(endDateStr + 'T23:59:59Z');
    return reflectionRepository.findByUserAndDateRange(userId, start, end);
  },
};
