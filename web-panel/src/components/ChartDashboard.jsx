
const ChartDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sales Overview */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            Sales Overview
          </h2>
          <div className="w-full overflow-hidden">
            <svg
              viewBox="0 0 330 190"
              className="h-48 w-full sm:h-64"
              preserveAspectRatio="xMidYMid meet"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <text x="0" y={184 - i * 40} fontSize="9" fill="#94a3b8">
                    ${i * 10}k
                  </text>
                  <line
                    x1="30"
                    x2="330"
                    y1={180 - i * 40}
                    y2={180 - i * 40}
                    stroke="#e2e8f0"
                  />
                </g>
              ))}
              <path
                d="M 10 150 L 60 100 L 110 105 L 160 65 L 210 60 L 260 35 L 310 15 L 310 180 L 10 180 Z"
                fill="url(#grad)"
                opacity="0.4"
              />
              <path
                d="M 10 150 L 60 100 L 110 105 L 160 65 L 210 60 L 260 35 L 310 15"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {[
                [10, 150],
                [60, 100],
                [110, 105],
                [160, 65],
                [210, 60],
                [260, 35],
                [310, 15],
              ].map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#3b82f6" />
              ))}
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="mt-3 flex justify-between px-2 text-[10px] text-slate-400 sm:text-xs">
            <span>Sep 23</span>
            <span>Sep 24</span>
            <span>Sep 25</span>
            <span>Sep 26</span>
            <span>Sep 27</span>
            <span>Sep 29</span>
            <span>Sep 29</span>
          </div>
        </div>

        {/* Order Status */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            Order Status
          </h2>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6 lg:flex-col">
            <div className="relative flex h-40 w-40 shrink-0 items-center justify-center sm:h-44 sm:w-44">
              <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="20"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="20"
                  strokeDasharray="37.7 376.99"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray="131.95 376.99"
                  strokeDashoffset="-37.7"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="20"
                  strokeDasharray="67.86 376.99"
                  strokeDashoffset="-169.65"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="20"
                  strokeDasharray="75.4 376.99"
                  strokeDashoffset="-237.51"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="60.32 376.99"
                  strokeDashoffset="-312.91"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-slate-900 sm:text-xl">
                  2,340
                </p>
                <p className="text-xs text-slate-500">Total Orders</p>
              </div>
            </div>
            <div className="w-full space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
                  <span className="text-slate-600">Pending</span>
                </span>
                <span className="font-medium text-slate-700">246 (10%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                  <span className="text-slate-600">Confirmed</span>
                </span>
                <span className="font-medium text-slate-700">812 (35%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-purple-500" />
                  <span className="text-slate-600">Preparing</span>
                </span>
                <span className="font-medium text-slate-700">421 (18%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                  <span className="text-slate-600">Out for Delivery</span>
                </span>
                <span className="font-medium text-slate-700">478 (20%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  <span className="text-slate-600">Delivered</span>
                </span>
                <span className="font-medium text-slate-700">383 (16%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartDashboard;
