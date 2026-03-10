"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-white/60 backdrop-blur-lg border-none shadow-none overflow-hidden py-8 px-6">
            <CardContent className="p-0 flex items-center justify-between gap-6">
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="rounded-md bg-white/60 backdrop-blur-lg overflow-hidden border-none shadow-none">
            <CardHeader className="pb-2 border-none">
              <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-md" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 h-[350px] flex items-center justify-center">
              <Skeleton className="h-[300px] w-full max-w-[300px] rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Skeleton */}
      <Card className="rounded-md bg-white/60 backdrop-blur-lg overflow-hidden border-none shadow-none">
        <CardHeader className="pb-2">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-10 h-10 rounded-md" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-8 w-32 rounded-full" />
           </div>
        </CardHeader>
        <CardContent className="p-2">
          <Skeleton className="h-[500px] w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}
