"use client"

import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Plus, User, FolderPlus, Package, MapPin } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface NavItem {
    title: string
    href: string
    icon: React.ElementType
    gradient: string
    disabled?: boolean
}

const navItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        gradient: "from-blue-400 to-indigo-500"
    },
    {
        title: "Project",
        href: "/create-project",
        icon: FolderPlus,
        gradient: "from-blue-400 to-blue-600"
    },
    {
        title: "Package",
        href: "/create-package",
        icon: Package,
        gradient: "from-violet-400 to-purple-500"
    },
    {
        title: "Location",
        href: "/create-location",
        icon: MapPin,
        gradient: "from-amber-400 to-orange-500"
    },
    {
        title: "Account",
        href: "/account",
        icon: User,
        gradient: "from-purple-400 to-pink-500",
        disabled: true
    }
]

export function SidebarNavigation() {
    const router = useRouter()
    const pathname = usePathname()

    const handleNavigation = (item: NavItem) => {
        if (item.disabled) return
        router.push(item.href)
    }

    const isNewAnalysisActive = pathname === "/new-analysis"

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 bg-white/40 backdrop-blur-xl border-r border-slate-200/50 z-50 flex flex-col items-center py-8">
            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col items-center gap-4">
                {/* Dashboard - first item */}
                {navItems.slice(0, 1).map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <div key={item.href} className="relative group">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleNavigation(item)}
                                        className={`
                                            relative w-12 h-12 rounded-md flex items-center justify-center
                                            ${isActive ? 'bg-linear-to-b from-[#3895FF] to-[#86B8F1]' : 'bg-[#f0fafd]/60 border border-slate-100/50'}
                                            hover:bg-linear-to-b hover:from-[#3895FF] hover:to-[#86B8F1] hover:border-none
                                            transition-all ease-in-out duration-200
                                        `}
                                    >
                                        <Icon
                                            className={`h-6 w-6 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} stroke-[2.5]`}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={12}>
                                    <p>{item.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )
                })}

                {/* New Analysis - Special eye-catchy button */}
                <div className="relative group">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => router.push("/new-analysis")}
                                className={`
                                    relative w-12 h-12 rounded-md flex items-center justify-center 
                                    ${isNewAnalysisActive ? 'bg-linear-to-b from-[#3895FF] to-[#86B8F1]' : 'bg-[#f0fafd]/60 border border-slate-100/50'}
                                    hover:bg-linear-to-b hover:from-[#3895FF] hover:to-[#86B8F1] hover:border-none
                                    transition-all ease-in-out duration-200
                                `}
                            >
                                <Plus
                                    className={`h-6 w-6 ${isNewAnalysisActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} stroke-[2.5]`}
                                />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>
                            <p>New Analysis</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Divider */}
                <div className="w-8 h-px bg-slate-200 my-1" />

                {/* Create items */}
                {navItems.slice(1, 4).map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <div key={item.href} className="relative group">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handleNavigation(item)}
                                        className={`
                                            relative w-12 h-12 rounded-md flex items-center justify-center
                                            ${isActive ? 'bg-linear-to-b from-[#3895FF] to-[#86B8F1]' : 'bg-[#f0fafd]/60 border border-slate-100/50'}
                                            hover:bg-linear-to-b hover:from-[#3895FF] hover:to-[#86B8F1] hover:border-none
                                            transition-all duration-200
                                        `}
                                    >
                                        <Icon
                                            className={`h-6 w-6 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} stroke-[2.5]`}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={12}>
                                    <p>{item.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )
                })}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto">
                <div className="relative group">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => { }}
                                className="w-12 h-12 rounded-full flex items-center justify-center  bg-linear-to-b from-[#225999] to-[#56A5FF] transition-all duration-200"
                                disabled
                            >
                                <User className="h-6 w-6 text-white" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>
                            <p>Account</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </aside>
    )
}
