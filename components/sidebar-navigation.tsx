"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, LayoutDashboard, User } from "lucide-react"

interface NavItem {
    title: string
    href: string
    icon: React.ElementType
    gradient: string
    disabled?: boolean
}

const navItems: NavItem[] = [
    {
        title: "Home",
        href: "/",
        icon: Home,
        gradient: "from-emerald-400 to-teal-500"
    },
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        gradient: "from-blue-400 to-indigo-500"
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

    return (
        <aside className="fixed left-0 top-0 h-screen w-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-50 flex flex-col items-center py-6 shadow-lg">
            {/* Logo */}
            <div className="mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-white font-bold text-lg">V</span>
                </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col items-center gap-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <div key={item.href} className="relative group">
                            <button
                                onClick={() => handleNavigation(item)}
                                disabled={item.disabled}
                                className={`
                                    relative w-11 h-11 rounded-xl flex items-center justify-center
                                    transition-all duration-300 ease-out
                                    ${item.disabled
                                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                                        : isActive
                                            ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg`
                                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300"
                                    }
                                `}
                                style={isActive && !item.disabled ? { boxShadow: `0 8px 20px -4px rgba(99, 102, 241, 0.4)` } : {}}
                            >
                                <Icon className="h-5 w-5" />
                            </button>

                            {/* Tooltip */}
                            <div className="
                                absolute left-full ml-3 top-1/2 -translate-y-1/2
                                px-3 py-1.5 rounded-lg
                                bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all duration-200 ease-out
                                whitespace-nowrap
                                shadow-lg
                                pointer-events-none
                            ">
                                {item.title}{item.disabled && " (Coming Soon)"}
                                {/* Arrow */}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
                            </div>
                        </div>
                    )
                })}
            </nav>

            {/* Bottom section */}
            <div className="mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
            </div>
        </aside>
    )
}
