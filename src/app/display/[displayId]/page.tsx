import { DisplayDashboard } from "@/components/display/DisplayDashboard";

interface DisplayPageProps {
  params: Promise<{ displayId: string }>;
}

export default async function DisplayPage({ params }: DisplayPageProps) {
  const { displayId } = await params;

  return <DisplayDashboard displayId={displayId} />;
}
