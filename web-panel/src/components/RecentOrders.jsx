import DataTable from "./DataTable";

const RecentOrders = () => {
  return (
    <DataTable label="Recent orders" minWidth={640} header={
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">
          Recent Orders
        </h2>
        <a
          href="/orders"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View All
        </a>
      </div>
    }>
      <thead>
        <tr>
          <th scope="col">Sr. No.</th>
          <th scope="col">Order ID</th>
          <th scope="col">Customer</th>
          <th scope="col">Amount</th>
          <th scope="col">Status</th>
          <th scope="col">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="font-medium text-slate-700">1</td>
          <td className="whitespace-nowrap font-medium text-slate-800">
            #ORD-10245
          </td>
          <td className="whitespace-nowrap">John Doe</td>
          <td className="whitespace-nowrap">$149.00</td>
          <td className="whitespace-nowrap">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              Out for Delivery
            </span>
          </td>
          <td className="whitespace-nowrap text-slate-500">
            Sep 29, 2026 02:24 PM
          </td>
        </tr>
        <tr>
          <td className="font-medium text-slate-700">2</td>
          <td className="whitespace-nowrap font-medium text-slate-800">
            #ORD-10244
          </td>
          <td className="whitespace-nowrap">Alice Smith</td>
          <td className="whitespace-nowrap">$89.00</td>
          <td className="whitespace-nowrap">
            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              Preparing
            </span>
          </td>
          <td className="whitespace-nowrap text-slate-500">
            Sep 29, 2026 11:12 AM
          </td>
        </tr>
        <tr>
          <td className="font-medium text-slate-700">3</td>
          <td className="whitespace-nowrap font-medium text-slate-800">
            #ORD-10243
          </td>
          <td className="whitespace-nowrap">Robert Johnson</td>
          <td className="whitespace-nowrap">$199.00</td>
          <td className="whitespace-nowrap">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              Confirmed
            </span>
          </td>
          <td className="whitespace-nowrap text-slate-500">
            Sep 29, 2026 09:45 AM
          </td>
        </tr>
        <tr>
          <td className="font-medium text-slate-700">4</td>
          <td className="whitespace-nowrap font-medium text-slate-800">
            #ORD-10242
          </td>
          <td className="whitespace-nowrap">Emma Wilson</td>
          <td className="whitespace-nowrap">$59.00</td>
          <td className="whitespace-nowrap">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Delivered
            </span>
          </td>
          <td className="whitespace-nowrap text-slate-500">
            Sep 28, 2026 07:21 PM
          </td>
        </tr>
      </tbody>
    </DataTable>
  );
};

export default RecentOrders;
