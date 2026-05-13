import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../api/auth';
import { hasSession } from '../api/client';

export function useAuth() {
  return useQuery({
    queryKey: ['session'],
    queryFn: fetchCurrentUser,
    enabled: hasSession(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}