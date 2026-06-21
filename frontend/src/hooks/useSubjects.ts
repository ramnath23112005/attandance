import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectService } from '../services/subject.service';
import { Subject } from '../types';

export function useSubjects(page = 1, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['subjects', page, filters],
    queryFn: () => subjectService.getAll(page, 50, filters as Record<string, string>),
  });
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: ['subjects', id],
    queryFn: () => subjectService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Subject, '_id' | 'isActive' | 'createdAt' | 'updatedAt'>) =>
      subjectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subject> }) =>
      subjectService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subjectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}
