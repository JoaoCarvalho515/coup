import { CoupGameClient } from "@/components/coup-game-client";

interface GamePageProps {
    params: Promise<{
        code: string
    }>
}

export default async function GamePage({ params }: GamePageProps) {
    const { code } = await params;
    return <CoupGameClient roomCode={ code } />;
}