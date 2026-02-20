"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, AlertCircle } from "lucide-react"
import { type Video } from "@/lib/api"

interface RecentAnalysesTableProps {
    videos: Video[]
    isLoading?: boolean
    onViewResults?: (videoId: string, detectionType: string) => void
}

export function RecentAnalysesTable({ videos, isLoading, onViewResults }: RecentAnalysesTableProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/30">Completed</Badge>
            case "processing":
                return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 hover:bg-blue-500/30">Processing</Badge>
            case "pending":
                return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/30">Pending</Badge>
            case "failed":
                return <Badge className="bg-red-500/20 text-red-600 border-red-500/30 hover:bg-red-500/30">Failed</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getDetectionTypeBadge = (type: string) => {
        if (type === "pothole-detection") {
            return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Pothole</Badge>
        }
        if (type === "pot-sign-detection") {
            return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Pothole & Sign</Badge>
        }
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Signboard</Badge>
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg font-bold text-blue-600">Recent Analyses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-14 bg-primary/5 rounded-lg" />
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-sm">No analyses found</p>
                        <p className="text-xs mt-1">Start a new analysis to see results here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {videos.slice(0, 8).map((video) => (
                            <div
                                key={video.id}
                                className="flex items-center justify-between p-4 hover:bg-primary/5"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {video.filename || `Video ${video.id.slice(0, 8)}...`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(video.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {getDetectionTypeBadge(video.detection_type)}
                                        {getStatusBadge(video.status)}
                                    </div>
                                    <div className="text-right flex-shrink-0 w-20">
                                        <p className="text-sm font-bold text-foreground">
                                            {video.detection_type === "pothole-detection"
                                                ? video.unique_pothole ?? 0
                                                : video.detection_type === "pot-sign-detection"
                                                    ? (video.unique_pothole ?? 0) + (video.unique_defected_sign_board ?? 0) + (video.unique_good_sign_board ?? 0)
                                                    : (video.unique_defected_sign_board ?? 0) + (video.unique_good_sign_board ?? 0)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground uppercase">Detections</p>
                                    </div>
                                </div>
                                {video.status === "completed" && onViewResults && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewResults(video.id, video.detection_type)}
                                        className="ml-4 flex-shrink-0"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}