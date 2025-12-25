import type { ServiceListItem } from "@/lib/servicesTypes";
import { ServiceCard } from "./ServiceCard";

type Props = {
  items: ServiceListItem[];
  onLike: (id: string, next: boolean) => void;
  onSave: (id: string, next: boolean) => void;
  layout: "grid" | "list";
};

export function ServicesFeed({ items, onLike, onSave, layout }: Props) {
  const gridClass =
    "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      className={
        layout === "grid"
          ? gridClass
          : "grid gap-4 grid-cols-1"
      }
    >
      {items.map((service) => (
        <ServiceCard key={service.id} service={service} onLike={onLike} onSave={onSave} />
      ))}
    </div>
  );
}
