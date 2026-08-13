import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    month: "Jan",
    compliance: 78,
  },
  {
    month: "Feb",
    compliance: 82,
  },
  {
    month: "Mar",
    compliance: 85,
  },
  {
    month: "Apr",
    compliance: 88,
  },
  {
    month: "May",
    compliance: 91,
  },
  {
    month: "Jun",
    compliance: 94,
  },
];

const ComplianceChart = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Compliance Trend</h2>

        <p className="text-sm text-slate-500">Monthly compliance percentage</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis domain={[0, 100]} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="compliance"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{
                r: 5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComplianceChart;
