"use client";

import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface GameplayPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PREVIEW_IMAGES = [
    "/ui/1.jpg",
    "/ui/2.jpg",
    "/ui/3.jpg",
];

export function GameplayPreviewModal({ isOpen, onClose }: GameplayPreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!isOpen) return null;

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % PREVIEW_IMAGES.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + PREVIEW_IMAGES.length) % PREVIEW_IMAGES.length);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-6xl aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in duration-300">

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
                >
                    <X className="size-6" />
                </Button>

                {/* Image */}
                <div className="relative w-full h-full">
                    <Image
                        src={PREVIEW_IMAGES[currentIndex]}
                        alt={`Gameplay Preview ${currentIndex + 1}`}
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevImage}
                        className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                    >
                        <ChevronLeft className="size-8" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextImage}
                        className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
                    >
                        <ChevronRight className="size-8" />
                    </Button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {PREVIEW_IMAGES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
