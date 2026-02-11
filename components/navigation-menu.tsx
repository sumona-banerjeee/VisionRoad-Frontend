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
            <SheetContent side="left" className="w-[320px] sm:w-[380px] bg-white backdrop-blur-xl border-r border-slate-200">
                <SheetHeader className="pb-6 border-b border-slate-100">
                    <SheetTitle className="text-2xl font-bold text-[#3b82f6]">
                        VisionRoad
                    </SheetTitle>
                    <p className="text-sm text-gray-500">
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
                                    ? "bg-slate-50 border border-slate-200"
                                    : "hover:bg-slate-50 border border-transparent hover:border-slate-100"
                                    }`}
                            >
                                <div className={`p-2.5 rounded-lg transition-all duration-300 border shadow-sm ${isActive
                                    ? "bg-[#2563eb] text-white border-[#2563eb]"
                                    : "bg-[#f0fafd] text-slate-900 group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] border-slate-100"
                                    }`}>
                                    <Icon
                                        className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm ${isActive ? "text-[#1e40af]" : "text-gray-700"
                                        }`}>
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                        {item.description}
                                    </p>
                                </div>
                                <ChevronRight className={`h-4 w-4 transition-all duration-300 ${isActive
                                    ? "text-[#1e40af] opacity-100"
                                    : "text-gray-300 opacity-0 group-hover:opacity-100"
                                    }`} />
                            </button>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-xs text-gray-400">
                        Sentient Geeks Pvt. Ltd.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}
