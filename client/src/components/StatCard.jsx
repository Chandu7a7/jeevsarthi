const colorMap = {
  primary: { text: 'text-[#1976D2]', bg: 'bg-[#1976D2]/10' },
  safe: { text: 'text-[#2E7D32]', bg: 'bg-[#2E7D32]/10' },
  alert: { text: 'text-[#F44336]', bg: 'bg-[#F44336]/10' },
  accent: { text: 'text-[#FF9800]', bg: 'bg-[#FF9800]/10' },
};

export function StatCard({ icon: Icon, title, value, trend, trendUp, color = 'primary' }) {
  const colorConfig = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-[12px] ${colorConfig.bg}`}>
          {Icon && <Icon className={`w-6 h-6 ${colorConfig.text}`} />}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${colorConfig.text} mb-1`}>{value}</p>
        {trend && (
          <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;

