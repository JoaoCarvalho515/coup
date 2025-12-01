"use client"

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import Link from "next/link"

export function GithubButton() {
    return (
        <div className="fixed top-4 left-4 z-50">
            <Button variant="ghost" size="icon" asChild className="rounded-full text-white/70 hover:text-white hover:bg-white/10">
                <Link href="https://github.com/mjfactor/-coup" target="_blank" rel="noopener noreferrer">
                    <Github className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">GitHub</span>
                </Link>
            </Button>
        </div>
    )
}
