import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { StatsCard } from "@/components/stats-card";
import { Heart, ListTodo, Medal, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const completedTasks = tasks?.filter(task => task.completed)?.length || 0;

  const mockPointsData = [
    { date: "Mon", points: 10 },
    { date: "Tue", points: 25 },
    { date: "Wed", points: 40 },
    { date: "Thu", points: 55 },
    { date: "Fri", points: 80 },
    { date: "Sat", points: 95 },
    { date: "Sun", points: 120 },
  ];

  if (tasksLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.username}!</h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Points"
              value={user?.points || 0}
              description="Keep earning points together!"
              icon={Heart}
            />
            <StatsCard
              title="Tasks Completed"
              value={completedTasks}
              description="Great teamwork!"
              icon={ListTodo}
            />
            <StatsCard
              title="Day Streak"
              value="7"
              description="Days of continuous love"
              icon={Activity}
            />
            <StatsCard
              title="Partner's Points"
              value={user?.points || 0}
              description="Growing together"
              icon={Medal}
            />
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Points History</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPointsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke="hsl(328, 73%, 44%)" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
