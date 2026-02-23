import { notFound } from "next/navigation";

import { fallbackCommunityGroups, type CommunityGroup } from "@/data/communityGroups";
import { CommunityDetailClient } from "@/components/community/CommunityDetailClient";
import { fetchCommunityGroup } from "@/api/community";

type Props = {
  params: {
    id: string;
  };
};

async function getGroup(id: string): Promise<CommunityGroup | null> {
  const remote = await fetchCommunityGroup(id);
  if (remote) return remote;
  return fallbackCommunityGroups.find((item) => item.id === id) ?? null;
}

export default async function CommunityDetailPage({ params }: Props) {
  const group = await getGroup(params.id);
  if (!group) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <CommunityDetailClient group={group} />
    </div>
  );
}
