"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, AlertTriangle, Film, Activity, Gauge, Monitor, SignpostBig } from "lucide-react"
import type { DetectionData } from "@/lib/types"

type SummarySectionProps = {
  data: DetectionData
}

export function SummarySection({ data }: SummarySectionProps) {
  const stats = [
    {
      label: "Total Road Damage",
      value: data.summary.total_road_damage || 0,
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Defected Signboards",
      value: data.summary.unique_defected_sign_board || 0,
      icon: SignpostBig,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Unique Potholes",
      value: data.summary.unique_pothole || 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Road Cracks",
      value: data.summary.unique_road_crack || 0,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Damaged Markings",
      value: data.summary.unique_damaged_road_marking || 0,
      icon: Activity,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      label: "Good Signboards",
      value: data.summary.unique_good_sign_board || 0,
      icon: SignpostBig,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Detection Rate",
      value: `${(data.summary.detection_rate || 0).toFixed(1)}%`,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Video FPS",
      value: (data.video_info.fps || 0).toFixed(1),
      icon: Gauge,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Resolution",
      value: `${data.video_info.width}×${data.video_info.height}`,
      icon: Monitor,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Total Frames",
      value: data.summary.total_frames || data.video_info.total_frames,
      icon: Film,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detection Summary</CardTitle>
        <CardDescription>Overview of road analysis results</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border/50 bg-card hover:shadow-md transition-shadow"
              >
                <div className={`${stat.bgColor} p-3 rounded-full mb-3`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`text-xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
