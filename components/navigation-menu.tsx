"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
    Menu,
    LayoutDashboard,
    ChevronRight,
    PlusCircle,
    FolderPlus,
    Package,
    MapPin,
    Map
} from "lucide-react"

interface NavItem {
    title: string
    description: string
    href: string
    icon: React.ElementType
}

const navItems: NavItem[] = [
    {
        title: "Dashboard",
        description: "View analytics, statistics, and recent analyses",
        href: "/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "New Analysis",
        description: "Start a new road analysis project",
        href: "/new-analysis",
        icon: PlusCircle
    },
    {
        title: "Create Project",
        description: "Create a new infrastructure project",
        href: "/create-project",
        icon: FolderPlus
    },
    {
        title: "Create Package",
        description: "Add a package under an existing project",
        href: "/create-package",
        icon: Package
    },
    {
        title: "Create Location",
        description: "Add a location under a project & package",
        href: "/create-location",
        icon: MapPin
    },
    {
        title: "Show Map",
        description: "View all detections on an interactive map",
        href: "/map",
        icon: Map
    }
]

export function NavigationMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const handleNavigation = (href: string) => {
        setIsOpen(false)
        router.push(href)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed top-4 left-4 z-50 h-11 w-11 rounded-xl glass-card border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-300"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5 text-foreground" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] sm:w-[380px] bg-background/95 backdrop-blur-xl border-r border-white/10">
                <SheetHeader className="pb-6 border-b border-white/10">
                    <SheetTitle className="text-2xl font-bold text-gradient">
                        VisionRoad
                    </SheetTitle>
                    <p className="text-sm text-muted-foreground">
                        AI-Powered Road Detection System
                    </p>
                </SheetHeader>

                {/* Navigation Items */}
                <nav className="mt-6 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <button
                                key={item.href}
                                onClick={() => handleNavigation(item.href)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 group ${isActive
                                    ? "bg-primary/15 border border-primary/30"
                                    : "hover:bg-white/5 border border-transparent hover:border-white/10"
                                    }`}
                            >
                                <div className={`p-2.5 rounded-lg transition-all duration-300 ${isActive
                                    ? "bg-[#60a5fa] text-white"
                                    : "bg-white/5 text-muted-foreground group-hover:bg-[#60a5fa]/10 group-hover:text-[#60a5fa]"
                                    }`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm ${isActive ? "text-primary" : "text-foreground"
                                        }`}>
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {item.description}
                                    </p>
                                </div>
                                <ChevronRight className={`h-4 w-4 transition-all duration-300 ${isActive
                                    ? "text-primary opacity-100"
                                    : "text-muted-foreground opacity-0 group-hover:opacity-100"
                                    }`} />
                            </button>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        Sentient Geeks Pvt. Ltd.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}
