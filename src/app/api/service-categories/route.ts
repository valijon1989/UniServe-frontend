import { NextResponse } from "next/server";
import { serviceCatalog } from "@/data/serviceCatalog";

export async function GET() {
  const payload = serviceCatalog.map((group) => ({
    slug: group.id,
    title: group.title,
    description: group.description,
    categories: group.categories.map((category) => ({
      slug: category.id,
      title: category.title,
      description: category.description
    }))
  }));

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=60"
    }
  });
}
