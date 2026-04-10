import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as applicationsApi from "../api/applications";
import type { ApplicationPayload } from "../api/applications";
import type { Application } from "../types/application";
import type { ApplicationStatus } from "../constants/applicationStatus";

export const APPLICATIONS_QUERY_KEY = ["applications", "list"] as const;

export function useApplicationsList(enabled: boolean) {
  return useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: () => applicationsApi.listApplications(),
    enabled,
  });
}

export function useApplicationMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (body: ApplicationPayload) =>
      applicationsApi.createApplication(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<ApplicationPayload>;
    }) => applicationsApi.updateApplication(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  /** Kanban: move card to a column — optimistic cache + PATCH `status`. */
  const moveToStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ApplicationStatus;
    }) => applicationsApi.updateApplication(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      const prev = qc.getQueryData<Application[]>(APPLICATIONS_QUERY_KEY);
      if (prev) {
        qc.setQueryData<Application[]>(
          APPLICATIONS_QUERY_KEY,
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(APPLICATIONS_QUERY_KEY, ctx.prev);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => applicationsApi.deleteApplication(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  return { create, update, moveToStatus, remove };
}
