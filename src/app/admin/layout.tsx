export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">TPOG App Admin</h1>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
