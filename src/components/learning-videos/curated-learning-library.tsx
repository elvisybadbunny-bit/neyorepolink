"use client";

import * as React from "react";
import { YouTubeLearningLibraryModal } from "@/components/academics/youtube-learning-library-modal";
import { Skeleton } from "@/components/ui/skeleton";

export function CuratedLearningLibrary() {
  const [subjects, setSubjects] = React.useState<{ id: string; name: string; code: string }[]>([]);
  const [strands, setStrands] = React.useState<{ id: string; name: string; subjectId: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/academics/subjects").then((response) => response.json()),
      fetch("/api/cbc/strands").then((response) => response.json()),
    ]).then(([subjectResult, strandResult]) => {
      if (subjectResult.ok) setSubjects(subjectResult.data.subjects ?? []);
      if (strandResult.ok) setStrands(strandResult.data.strands ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3"><Skeleton className="h-16 rounded-2xl"/><Skeleton className="h-80 rounded-3xl"/></div>;

  return (
    <YouTubeLearningLibraryModal
      open
      onOpenChange={() => undefined}
      subjects={subjects}
      strands={strands}
    />
  );
}
