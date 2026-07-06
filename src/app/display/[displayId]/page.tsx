import { DisplayDashboard } from "@/components/display/DisplayDashboard";

interface DisplayPageProps {
  params: Promise<{ displayId: string }>;
  searchParams: Promise<{ key?: string }>;
}

export default async function DisplayPage({ params, searchParams }: DisplayPageProps) {
  const { displayId } = await params;
  const { key } = await searchParams;

  return <DisplayDashboard displayId={displayId} displayKey={key} />;
}
