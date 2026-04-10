import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as applicationsApi from "../api/applications";
import type { ApplicationPayload } from "../api/applications";

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

  const remove = useMutation({
    mutationFn: (id: string) => applicationsApi.deleteApplication(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
    },
  });

  return { create, update, remove };
}
