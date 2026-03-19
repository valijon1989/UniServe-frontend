import { redirect } from "next/navigation";

export default function NewListingPage() {
  redirect("/agent/listings?create=1");
}
