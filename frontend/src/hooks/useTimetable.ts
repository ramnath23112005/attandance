import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableService } from '../services/timetable.service';
import { TimetableEntry } from '../types';

export function useWeeklyTimetable() {
  return useQuery({
    queryKey: ['timetable', 'weekly'],
    queryFn: () => timetableService.getWeekly(),
  });
}

export function useTimetableByDay(day: string) {
  return useQuery({
    queryKey: ['timetable', 'day', day],
    queryFn: () => timetableService.getByDay(day),
    enabled: !!day,
  });
}

export function useTimetableList(page = 1, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['timetable', 'list', page, filters],
    queryFn: () => timetableService.getAll(page, 50, filters as Record<string, string>),
  });
}

export function useCreateTimetable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<TimetableEntry, '_id' | 'isActive' | 'createdAt' | 'updatedAt'>) =>
      timetableService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
}

export function useUpdateTimetable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimetableEntry> }) =>
      timetableService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
}

export function useDeleteTimetable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timetableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
}
