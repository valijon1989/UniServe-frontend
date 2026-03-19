"use client";

import type { DetailReview } from "@/components/service-detail/types";
import { ServiceReviews } from "@/components/service-detail/ServiceReviews";

type CaregiverReviewsProps = {
  rating: number;
  reviewCount: number;
  reviews: DetailReview[];
};

export function CaregiverReviews({
  rating,
  reviewCount,
  reviews
}: CaregiverReviewsProps) {
  return <ServiceReviews rating={rating} reviewCount={reviewCount} reviews={reviews} />;
}
