import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { useAuth } from "./auth";
import { unwrapList } from "./format";
import type { Student } from "./types";
import { DEMO_MODE, demoStudentPage } from "../demo";
import { useLiveOrDemo } from "../demo/useLiveOrDemo";

type ChildState = {
  children: Student[];
  selected?: Student;
  setSelectedId: (id: string) => void;
  isDemo: boolean;
};

const Ctx = createContext<ChildState | undefined>(undefined);

export function ChildProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const enabled = user?.role === "PARENT" || user?.role === "STUDENT";
  const query = useQuery({
    queryKey: ["students", "scope"],
    enabled,
    queryFn: () => api<{ items: Student[] }>("/api/students?size=20"),
  });
  const live = useLiveOrDemo(query, demoStudentPage);
  const list = enabled ? unwrapList<Student>(live.data) : [];
  const [selectedId, setSelectedId] = useState<string>(() => sessionStorage.getItem("twhps_child") ?? "");

  useEffect(() => {
    if (!list.length) return;
    if (!selectedId || !list.some((s) => s.id === selectedId)) {
      const next = list[0].id;
      setSelectedId(next);
      sessionStorage.setItem("twhps_child", next);
    }
  }, [list, selectedId]);

  const value = useMemo<ChildState>(
    () => ({
      children: list,
      selected: list.find((s) => s.id === selectedId) ?? list[0],
      setSelectedId: (id: string) => {
        setSelectedId(id);
        sessionStorage.setItem("twhps_child", id);
      },
      isDemo: enabled && live.isDemo,
    }),
    [list, selectedId, live.isDemo]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChildScope() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ChildProvider missing");
  return ctx;
}
