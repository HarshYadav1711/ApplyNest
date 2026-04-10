import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as applicationsApi from "../api/applications";
import type { ApplicationStatus } from "../constants/statuses";
import type { ApplicationDto } from "../types/api";

export function useApplicationsList(enabled: boolean) {
  return useQuery({
    queryKey: ["applications", "list"],
    queryFn: () => applicationsApi.listApplications(),
    enabled,
  });
}

export function useApplicationMutation() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: applicationsApi.createApplication,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["applications", "list"] });
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof applicationsApi.updateApplication>[1];
    }) => applicationsApi.updateApplication(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["applications", "list"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ApplicationStatus;
    }) => applicationsApi.updateApplication(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["applications", "list"] });
      const prev = qc.getQueryData<ApplicationDto[]>(["applications", "list"]);
      if (prev) {
        qc.setQueryData<ApplicationDto[]>(
          ["applications", "list"],
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(["applications", "list"], ctx.prev);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["applications", "list"] });
    },
  });

  const remove = useMutation({
    mutationFn: applicationsApi.deleteApplication,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["applications", "list"] });
    },
  });

  return { create, update, updateStatus, remove };
}
