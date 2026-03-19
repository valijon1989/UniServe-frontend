"use client";

import type { RelatedDetailItem } from "@/components/service-detail/types";
import { ServiceRelated } from "@/components/service-detail/ServiceRelated";

type RelatedCaregiversProps = {
  items: RelatedDetailItem[];
};

export function RelatedCaregivers({ items }: RelatedCaregiversProps) {
  return <ServiceRelated title="O'xshash enagalar" items={items} />;
}
