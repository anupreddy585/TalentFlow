import React from 'react';
import { BarChart3, TrendingUp, Users, Briefcase, Clock, Target } from 'lucide-react';

export function AnalyticsPage() {
  const metrics = [
    { name: 'Total Applications', value: '1,234', change: '+12%', trend: 'up' },
    { name: 'Active Jobs', value: '18', change: '+3', trend: 'up' },
    { name: 'Candidates Hired', value: '42', change: '+8%', trend: 'up' },
    { name: 'Avg. Time to Hire', value: '21 days', change: '-3 days', trend: 'down' },
    { name: 'Interview Success Rate', value: '68%', change: '+5%', trend: 'up' },
    { name: 'Offer Acceptance Rate', value: '85%', change: '+2%', trend: 'up' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your hiring performance and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-blue-600'
              }`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Application Funnel</h2>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Time to Hire Trends</h2>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { action: 'New application received', job: 'Senior Software Engineer', time: '2 hours ago', type: 'application' },
              { action: 'Candidate moved to Interview stage', candidate: 'Sarah Johnson', time: '4 hours ago', type: 'stage_change' },
              { action: 'Assessment completed', candidate: 'Mike Chen', time: '6 hours ago', type: 'assessment' },
              { action: 'Job posted', job: 'Product Manager', time: '1 day ago', type: 'job' },
              { action: 'Offer extended', candidate: 'Emily Davis', time: '2 days ago', type: 'offer' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {activity.type === 'application' && <Users className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'stage_change' && <TrendingUp className="w-5 h-5 text-green-600" />}
                  {activity.type === 'assessment' && <Target className="w-5 h-5 text-purple-600" />}
                  {activity.type === 'job' && <Briefcase className="w-5 h-5 text-orange-600" />}
                  {activity.type === 'offer' && <TrendingUp className="w-5 h-5 text-green-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.job || activity.candidate} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AnalyticsPage
