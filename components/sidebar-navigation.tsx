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
        <aside className="fixed left-0 top-0 h-screen w-20 bg-white border-r border-slate-200 z-50 flex flex-col items-center py-8 shadow-sm">
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
                                    ${isActive ? 'bg-[#2563eb] border-[#2563eb] shadow-md' : 'bg-[#f0fafd] border-slate-100'}
                                    transition-all duration-300 ease-out
                                    hover:scale-110 hover:shadow-lg hover:bg-[#2563eb] hover:border-[#2563eb]
                                    active:scale-95 border
                                `}
                            >
                                <Icon
                                    className={`h-6 w-6 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-white'} stroke-[2.5]`}
                                />
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
                            ${isNewAnalysisActive ? 'bg-[#2563eb] border-[#2563eb] shadow-md' : 'bg-[#f0fafd] border-slate-100'}
                            transition-all duration-300 ease-out
                            hover:scale-110 hover:shadow-lg hover:bg-[#2563eb] hover:border-[#2563eb]
                            active:scale-95 border
                        `}
                    >
                        <Plus
                            className={`h-6 w-6 transition-all duration-300 ${isNewAnalysisActive ? 'text-white' : 'text-slate-900 group-hover:text-white'} stroke-[2.5]`}
                        />
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
                <div className="w-8 h-px bg-slate-200 my-1" />

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
                                    ${isActive ? 'bg-[#2563eb] border-[#2563eb] shadow-md' : 'bg-[#f0fafd] border-slate-100'}
                                    transition-all duration-300 ease-out
                                    hover:scale-110 hover:shadow-lg hover:bg-[#2563eb] hover:border-[#2563eb]
                                    active:scale-95 border
                                `}
                            >
                                <Icon
                                    className={`h-6 w-6 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-white'} stroke-[2.5]`}
                                />
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
                        className="w-12 h-12 rounded-full bg-[#f0fafd] flex items-center justify-center cursor-not-allowed opacity-80 border border-slate-100 transition-all duration-300 hover:scale-110 hover:bg-[#2563eb] hover:border-[#2563eb]"
                        disabled
                    >
                        <User className="h-6 w-6 text-slate-900 transition-colors duration-300 group-hover:text-white" />
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
