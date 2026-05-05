import { getParticipantById } from "@/lib/queries/campaigns";
import { notFound, redirect } from "next/navigation";

interface ParticipantRedirectPageProps {
  params: Promise<{ participantId: string }>;
}

export default async function ParticipantRedirectPage({
  params,
}: ParticipantRedirectPageProps) {
  const { participantId } = await params;
  const participant = await getParticipantById(participantId);

  if (!participant) {
    notFound();
  }

  redirect(`/app/campaigns/${participant.campaign_id}/employees/${participant.id}`);
}
