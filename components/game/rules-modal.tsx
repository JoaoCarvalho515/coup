"use client";

import { Button } from "@/components/ui/button";
import { X, BookOpen } from "lucide-react";
import Image from "next/image";
import { CharacterType } from "@/lib/game-logic";

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CHARACTER_IMAGES: Record<CharacterType, string> = {
    Duke: "/textures/duke.jpg",
    Assassin: "/textures/assassin.jpg",
    Captain: "/textures/captain.jpg",
    Ambassador: "/textures/ambassador.jpg",
    Contessa: "/textures/contessa.jpg",
};

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <BookOpen className="size-6 text-purple-400" />
                        <h2 className="text-2xl font-bold text-white">Game Rules</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                    >
                        <X className="size-6" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 text-slate-300">

                    {/* Overview */}
                    <section>
                        <h3 className="text-xl font-bold text-purple-400 mb-2">Objective</h3>
                        <p>
                            Eliminate the influence of all other players. The last player with influence (cards) remaining wins.
                        </p>
                    </section>

                    {/* Characters */}
                    <section>
                        <h3 className="text-xl font-bold text-purple-400 mb-4">Characters & Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Duke */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex gap-4">
                                <div className="relative w-28 h-40 flex-shrink-0 rounded overflow-hidden border border-slate-600">
                                    <Image src={CHARACTER_IMAGES.Duke} alt="Duke" fill className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Duke</h4>
                                    <ul className="text-sm space-y-1 mt-1">
                                        <li><span className="text-purple-400 font-semibold">Tax:</span> Take 3 coins.</li>
                                        <li><span className="text-blue-400 font-semibold">Blocks:</span> Foreign Aid.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Assassin */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex gap-4">
                                <div className="relative w-28 h-40 flex-shrink-0 rounded overflow-hidden border border-slate-600">
                                    <Image src={CHARACTER_IMAGES.Assassin} alt="Assassin" fill className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Assassin</h4>
                                    <ul className="text-sm space-y-1 mt-1">
                                        <li><span className="text-red-400 font-semibold">Assassinate:</span> Pay 3 coins to kill an influence.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Captain */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex gap-4">
                                <div className="relative w-28 h-40 flex-shrink-0 rounded overflow-hidden border border-slate-600">
                                    <Image src={CHARACTER_IMAGES.Captain} alt="Captain" fill className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Captain</h4>
                                    <ul className="text-sm space-y-1 mt-1">
                                        <li><span className="text-cyan-400 font-semibold">Steal:</span> Take 2 coins from another player.</li>
                                        <li><span className="text-blue-400 font-semibold">Blocks:</span> Steal.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Ambassador */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex gap-4">
                                <div className="relative w-28 h-40 flex-shrink-0 rounded overflow-hidden border border-slate-600">
                                    <Image src={CHARACTER_IMAGES.Ambassador} alt="Ambassador" fill className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Ambassador</h4>
                                    <ul className="text-sm space-y-1 mt-1">
                                        <li><span className="text-indigo-400 font-semibold">Exchange:</span> Draw 2 cards, return 2.</li>
                                        <li><span className="text-blue-400 font-semibold">Blocks:</span> Steal.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Contessa */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex gap-4">
                                <div className="relative w-28 h-40 flex-shrink-0 rounded overflow-hidden border border-slate-600">
                                    <Image src={CHARACTER_IMAGES.Contessa} alt="Contessa" fill className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">Contessa</h4>
                                    <ul className="text-sm space-y-1 mt-1">
                                        <li><span className="text-blue-400 font-semibold">Blocks:</span> Assassination.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* General Actions */}
                    <section>
                        <h3 className="text-xl font-bold text-purple-400 mb-2">General Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
                                <h4 className="font-bold text-white">Income</h4>
                                <p className="text-sm">Take 1 coin. Cannot be blocked.</p>
                            </div>
                            <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
                                <h4 className="font-bold text-white">Foreign Aid</h4>
                                <p className="text-sm">Take 2 coins. Can be blocked by Duke.</p>
                            </div>
                            <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
                                <h4 className="font-bold text-white">Coup</h4>
                                <p className="text-sm">Pay 7 coins. Choose a player to lose influence. Unblockable.</p>
                            </div>
                        </div>
                    </section>

                    {/* Challenges & Blocking */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-2">Challenges</h3>
                            <p className="text-sm leading-relaxed">
                                Any action that uses a character (Tax, Assassinate, Steal, Exchange) or any Block can be challenged.
                                <br /><br />
                                If challenged, you must prove you have the character.
                                <br />
                                <span className="text-green-400">If you show the card:</span> You shuffle it back, draw a new one, and the challenger loses an influence.
                                <br />
                                <span className="text-red-400">If you can&apos;t/won&apos;t:</span> You lose an influence.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-2">Blocking</h3>
                            <p className="text-sm leading-relaxed">
                                You can claim a character to block an action against you (or Foreign Aid).
                                <br /><br />
                                Blocks can be challenged just like actions.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-xl flex justify-end">
                    <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
                        Close Rules
                    </Button>
                </div>
            </div>
        </div>
    );
}
