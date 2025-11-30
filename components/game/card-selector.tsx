"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Card as GameCard } from "@/lib/game-logic";
import { Skull } from "lucide-react";

interface CardSelectorProps {
    cards: GameCard[];
    title: string;
    description: string;
    selectCount: number;
    onConfirm: (selectedCardIds: string[]) => void;
}

const CHARACTER_ICONS: Record<string, string> = {
    Duke: "👑",
    Assassin: "🗡️",
    Captain: "⚓",
    Ambassador: "📜",
    Contessa: "🛡️",
};

export function CardSelector({
    cards,
    title,
    description,
    selectCount,
    onConfirm,
}: CardSelectorProps) {
    const [selectedCards, setSelectedCards] = useState<string[]>([]);

    const toggleCard = (cardId: string) => {
        setSelectedCards(prev => {
            if (prev.includes(cardId)) {
                return prev.filter(id => id !== cardId);
            } else if (prev.length < selectCount) {
                return [...prev, cardId];
            }
            return prev;
        });
    };

    const handleConfirm = () => {
        if (selectedCards.length === selectCount) {
            onConfirm(selectedCards);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500 max-w-2xl w-full">
                <CardHeader>
                    <CardTitle className="text-2xl text-purple-300">{title}</CardTitle>
                    <p className="text-slate-400">{description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {cards.map((card) => (
                            <button
                                key={card.id}
                                onClick={() => toggleCard(card.id)}
                                disabled={card.revealed}
                                className={`w-full h-40 rounded-lg flex flex-col items-center justify-center text-4xl font-bold transition-all ${card.revealed
                                        ? "bg-red-900/50 border-2 border-red-500 opacity-50 cursor-not-allowed"
                                        : selectedCards.includes(card.id)
                                            ? "bg-gradient-to-br from-green-600 to-emerald-600 border-4 border-green-400 shadow-lg shadow-green-500/50 scale-105"
                                            : "bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-400 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
                                    }`}
                            >
                                {card.revealed ? (
                                    <>
                                        <Skull className="size-12 text-red-400" />
                                        <span className="text-sm mt-2 text-red-400">{card.character}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{CHARACTER_ICONS[card.character]}</span>
                                        <span className="text-sm mt-2 text-white">{card.character}</span>
                                    </>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>Selected: {selectedCards.length} / {selectCount}</span>
                            {selectedCards.length < selectCount && (
                                <span className="text-yellow-400">Select {selectCount - selectedCards.length} more</span>
                            )}
                        </div>
                        <Button
                            onClick={handleConfirm}
                            disabled={selectedCards.length !== selectCount}
                            className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                        >
                            Confirm Selection
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
