interface GamePageProps {
    params: {
        code: string
    }
}

export default function GamePage({ params }: GamePageProps) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Game Room</h1>
                <p className="text-4xl font-mono font-bold mb-4">{params.code.toUpperCase()}</p>
                <p className="text-muted-foreground">Waiting for players...</p>
            </div>
        </div>
    )
}
