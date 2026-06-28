"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api/endpoints";
import { ApiError } from "./api/client";

const USER_KEY = ["auth", "user"];

/** Current authenticated user (null when unauthenticated). */
export function useCurrentUser() {
  return useQuery<App.Data.UserData | null>({
    queryKey: USER_KEY,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (user) => qc.setQueryData(USER_KEY, user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      email: string;
      password: string;
      passwordConfirmation: string;
    }) => authApi.register(input.name, input.email, input.password, input.passwordConfirmation),
    onSuccess: (user) => qc.setQueryData(USER_KEY, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => qc.setQueryData(USER_KEY, null),
  });
}
