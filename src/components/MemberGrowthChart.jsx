import { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MemberGrowthChart() {
  const [memberData, setMemberData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [stats, setStats] = useState({
    total: 0,
    newThisPeriod: 0,
    growthRate: 0
  });

  useEffect(() => {
    fetchMemberData();
  }, [timeRange]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);

      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: allMembers, error: allError } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (allError) throw allError;

      const { data: recentMembers, error: recentError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      if (recentError) throw recentError;

      const membersByDate = {};
      let runningTotal = 0;

      allMembers.forEach(member => {
        const date = new Date(member.created_at);
        const dateKey = date.toISOString().split('T')[0];

        if (!membersByDate[dateKey]) {
          membersByDate[dateKey] = 0;
        }
        membersByDate[dateKey]++;
      });

      const chartData = [];
      const sortedDates = Object.keys(membersByDate).sort();

      for (const date of sortedDates) {
        runningTotal += membersByDate[date];

        const dateObj = new Date(date);
        if (dateObj >= startDate) {
          chartData.push({
            date: dateObj,
            dateString: date,
            newMembers: membersByDate[date],
            totalMembers: runningTotal
          });
        }
      }

      if (chartData.length === 0 && allMembers.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        chartData.push({
          date: new Date(),
          dateString: today,
          newMembers: 0,
          totalMembers: allMembers.length
        });
      }

      setMemberData(chartData);

      const previousPeriodStart = new Date();
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysAgo * 2));
      previousPeriodStart.setDate(previousPeriodStart.getDate() + daysAgo);

      const { data: previousMembers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', startDate.toISOString());

      const previousCount = previousMembers?.length || 0;
      const currentCount = recentMembers?.length || 0;
      const growthRate = previousCount > 0
        ? ((currentCount - previousCount) / previousCount * 100)
        : currentCount > 0 ? 100 : 0;

      setStats({
        total: allMembers.length,
        newThisPeriod: currentCount,
        growthRate: Math.round(growthRate)
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching member data:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adopteez-primary"></div>
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...memberData.map(d => d.totalMembers), 1);
  const maxNew = Math.max(...memberData.map(d => d.newMembers), 1);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-adopteez-primary" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Medlemsvækst</h2>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={20} />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
            >
              <option value="7">Sidste 7 dage</option>
              <option value="14">Sidste 14 dage</option>
              <option value="30">Sidste 30 dage</option>
              <option value="60">Sidste 60 dage</option>
              <option value="90">Sidste 90 dage</option>
              <option value="180">Sidste 6 måneder</option>
              <option value="365">Sidste år</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-600 mb-1">Totalt antal medlemmer</p>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-sm font-medium text-green-600 mb-1">Nye i perioden</p>
            <p className="text-3xl font-bold text-green-900">{stats.newThisPeriod}</p>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-4 ${
            stats.growthRate >= 0
              ? 'from-purple-50 to-purple-100'
              : 'from-red-50 to-red-100'
          }`}>
            <p className={`text-sm font-medium mb-1 ${
              stats.growthRate >= 0 ? 'text-purple-600' : 'text-red-600'
            }`}>
              Vækstrate
            </p>
            <p className={`text-3xl font-bold ${
              stats.growthRate >= 0 ? 'text-purple-900' : 'text-red-900'
            }`}>
              {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {memberData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen data tilgængelig for denne periode</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kumulativt antal medlemmer</h3>
            <div className="relative h-64 mb-8">
              <svg className="w-full h-full">
                <g>
                  {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => {
                    const y = 240 - (percent * 220);
                    const value = Math.round(maxTotal * percent);
                    return (
                      <g key={i}>
                        <line
                          x1="40"
                          y1={y}
                          x2="100%"
                          y2={y}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                        <text
                          x="5"
                          y={y + 4}
                          className="text-xs fill-gray-500"
                        >
                          {value}
                        </text>
                      </g>
                    );
                  })}
                </g>

                <g>
                  {memberData.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#1A237E"
                      strokeWidth="3"
                      points={memberData.map((d, i) => {
                        const x = 50 + (i / (memberData.length - 1)) * (window.innerWidth > 768 ? 800 : 300);
                        const y = 240 - (d.totalMembers / maxTotal * 220);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  )}

                  {memberData.map((d, i) => {
                    const x = 50 + (i / (memberData.length - 1 || 1)) * (window.innerWidth > 768 ? 800 : 300);
                    const y = 240 - (d.totalMembers / maxTotal * 220);
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#1A237E"
                          className="hover:r-6 transition-all cursor-pointer"
                        >
                          <title>{formatDate(d.date)}: {d.totalMembers} medlemmer</title>
                        </circle>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nye medlemmer per dag</h3>
            <div className="relative h-48">
              <svg className="w-full h-full">
                <g>
                  {[0, 0.5, 1].map((percent, i) => {
                    const y = 180 - (percent * 160);
                    const value = Math.round(maxNew * percent);
                    return (
                      <g key={i}>
                        <line
                          x1="40"
                          y1={y}
                          x2="100%"
                          y2={y}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                        <text
                          x="5"
                          y={y + 4}
                          className="text-xs fill-gray-500"
                        >
                          {value}
                        </text>
                      </g>
                    );
                  })}
                </g>

                <g>
                  {memberData.map((d, i) => {
                    const barWidth = Math.max((window.innerWidth > 768 ? 800 : 300) / memberData.length - 2, 4);
                    const x = 50 + (i / (memberData.length || 1)) * (window.innerWidth > 768 ? 800 : 300);
                    const height = (d.newMembers / maxNew * 160);
                    const y = 180 - height;

                    return (
                      <rect
                        key={i}
                        x={x - barWidth / 2}
                        y={y}
                        width={barWidth}
                        height={height}
                        fill="#FF6F00"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <title>{formatDate(d.date)}: {d.newMembers} nye</title>
                      </rect>
                    );
                  })}
                </g>
              </svg>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-6 text-xs text-gray-600">
              {memberData.filter((_, i) => {
                const step = Math.ceil(memberData.length / 10);
                return i % step === 0 || i === memberData.length - 1;
              }).map((d, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 rounded">
                  {formatDate(d.date)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
