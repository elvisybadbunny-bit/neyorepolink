import { requirePageUser } from "@/lib/core/page-guards";
import { LearningVideosClient } from "@/components/learning-videos/learning-videos-client";
import { CuratedLearningLibrary } from "@/components/learning-videos/curated-learning-library";

export const dynamic = "force-dynamic";

export default async function LearningVideosPage() {
  await requirePageUser();
  return <div className="space-y-8"><div><h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-navy-50">Learning Videos</h1><p className="mt-1 text-sm text-navy-500 dark:text-navy-400">Search educational videos, watch inside NEYO, and cast to a class TV or projector.</p></div><LearningVideosClient /><section className="space-y-3"><div><h2 className="text-xl font-bold text-navy-900 dark:text-white">Curated learning library</h2><p className="text-sm text-navy-500 dark:text-navy-400">Browse school and nationally reviewed, strand-linked videos on this normal page. Submit links for review without leaving Learning Videos.</p></div><CuratedLearningLibrary /></section></div>;
}
