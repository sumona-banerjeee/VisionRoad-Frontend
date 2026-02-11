"use client"

import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Plus, User, FolderPlus, Package, MapPin } from "lucide-react"

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
        title: "Create Project",
        href: "/create-project",
        icon: FolderPlus,
        gradient: "from-blue-400 to-blue-600"
    },
    {
        title: "Create Package",
        href: "/create-package",
        icon: Package,
        gradient: "from-violet-400 to-purple-500"
    },
    {
        title: "Create Location",
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
        <aside className="fixed left-0 top-0 h-screen w-20 bg-[#2563eb] border-r border-[#2563eb]/20 z-50 flex flex-col items-center py-8 shadow-2xl">
            {/* Logo */}
            <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg border-2 border-[#1e40af] transition-transform duration-300 hover:scale-110">
                    <span className="text-[#2563eb] font-black text-xl">V</span>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col items-center gap-4">
                {/* Dashboard - first item */}
                {navItems.slice(0, 1).map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <div key={item.href} className="relative group">
                            <button
                                onClick={() => handleNavigation(item)}
                                className={`
                                    relative w-12 h-12 rounded-xl flex items-center justify-center
                                    bg-white text-[#2563eb] shadow-lg border-2
                                    ${isActive ? 'border-[#2563eb] ring-2 ring-white/30' : 'border-[#1e40af]'}
                                    transition-all duration-300 ease-out
                                    hover:scale-110 hover:shadow-xl
                                    active:scale-95
                                `}
                            >
                                <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                            </button>
                            <div className="
                                absolute left-full ml-3 top-1/2 -translate-y-1/2
                                px-3 py-1.5 rounded-lg
                                bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all duration-200 ease-out
                                whitespace-nowrap shadow-lg pointer-events-none
                            ">
                                {item.title}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                            </div>
                        </div>
                    )
                })}

                {/* New Analysis - Special eye-catchy button */}
                <div className="relative group">
                    <button
                        onClick={() => router.push("/new-analysis")}
                        className={`
                            relative w-12 h-12 rounded-xl flex items-center justify-center
                            bg-white text-[#2563eb] shadow-lg border-2
                            ${isNewAnalysisActive ? 'border-[#2563eb] ring-2 ring-white/30' : 'border-[#1e40af]'}
                            transition-all duration-300 ease-out
                            hover:scale-110 hover:shadow-xl
                            active:scale-95
                        `}
                    >
                        <Plus className={`h-6 w-6 ${isNewAnalysisActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                    </button>
                    <div className="
                        absolute left-full ml-3 top-1/2 -translate-y-1/2
                        px-3 py-1.5 rounded-lg
                        bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 ease-out
                        whitespace-nowrap shadow-lg pointer-events-none
                    ">
                        Start New Analysis
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                    </div>
                </div>

                {/* Divider */}
                <div className="w-8 h-px bg-white/20 my-1" />

                {/* Create items */}
                {navItems.slice(1, 4).map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <div key={item.href} className="relative group">
                            <button
                                onClick={() => handleNavigation(item)}
                                className={`
                                    relative w-12 h-12 rounded-xl flex items-center justify-center
                                    bg-white text-[#2563eb] shadow-lg border-2
                                    ${isActive ? 'border-[#2563eb] ring-2 ring-white/30' : 'border-[#1e40af]'}
                                    transition-all duration-300 ease-out
                                    hover:scale-110 hover:shadow-xl
                                    active:scale-95
                                `}
                            >
                                <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                            </button>
                            <div className="
                                absolute left-full ml-3 top-1/2 -translate-y-1/2
                                px-3 py-1.5 rounded-lg
                                bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all duration-200 ease-out
                                whitespace-nowrap shadow-lg pointer-events-none
                            ">
                                {item.title}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                            </div>
                        </div>
                    )
                })}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto">
                <div className="relative group">
                    <button
                        onClick={() => { }}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center cursor-not-allowed opacity-80 border-2 border-[#1e40af] transition-transform duration-300 hover:scale-110"
                        disabled
                    >
                        <User className="h-6 w-6 text-[#2563eb]" />
                    </button>
                    <div className="
                        absolute left-full ml-3 top-1/2 -translate-y-1/2
                        px-3 py-1.5 rounded-lg
                        bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 ease-out
                        whitespace-nowrap shadow-lg pointer-events-none
                    ">
                        Account (Coming Soon)
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                    </div>
                </div>
            </div>
        </aside>
    )
}
