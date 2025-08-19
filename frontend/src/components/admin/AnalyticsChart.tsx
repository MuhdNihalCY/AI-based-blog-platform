'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data - in a real app, this would come from the API
const data = [
  { name: 'Jan', posts: 4, views: 2400 },
  { name: 'Feb', posts: 3, views: 1398 },
  { name: 'Mar', posts: 2, views: 9800 },
  { name: 'Apr', posts: 2, views: 3908 },
  { name: 'May', posts: 1, views: 4800 },
  { name: 'Jun', posts: 2, views: 3800 },
  { name: 'Jul', posts: 3, views: 4300 },
];

export default function AnalyticsChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="views" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="posts" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Views</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-600">Posts</span>
        </div>
      </div>
    </div>
  );
}
