export default function DashboardPage() {
  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>

      <p className="text-zinc-400 mb-8">
        Welcome to your Nexentra AI dashboard.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-lg font-semibold">Total Leads</h2>
          <p className="text-3xl font-bold mt-2">1,234</p>
          <p className="text-green-400 mt-1">+12% from last month</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-lg font-semibold">Active Calls</h2>
          <p className="text-3xl font-bold mt-2">42</p>
          <p className="text-zinc-400 mt-1">Currently active</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-lg font-semibold">Conversion Rate</h2>
          <p className="text-3xl font-bold mt-2">14.2%</p>
          <p className="text-green-400 mt-1">+2.1% from last month</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <p className="text-3xl font-bold mt-2">$45,231</p>
          <p className="text-green-400 mt-1">+8.3% from last month</p>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        <a
          href="/dashboard/leads"
          className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-white transition"
        >
          <h2 className="text-xl font-semibold">Leads</h2>
          <p className="text-zinc-400 mt-2">Manage your leads</p>
        </a>

        <a
          href="/dashboard/calls"
          className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-white transition"
        >
          <h2 className="text-xl font-semibold">Calls</h2>
          <p className="text-zinc-400 mt-2">View AI calls</p>
        </a>

        <a
          href="/dashboard/analytics"
          className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-white transition"
        >
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-zinc-400 mt-2">Track performance</p>
        </a>

        <a
          href="/dashboard/settings"
          className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-white transition"
        >
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-zinc-400 mt-2">Manage account settings</p>
        </a>
      </div>

      {/* Add Lead Button */}
      <div className="mt-8">
        <a
          href="/dashboard/leads"
          className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg font-semibold"
        >
          Add Lead
        </a>
      </div>
    </div>
  )
}