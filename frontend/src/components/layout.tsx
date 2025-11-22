import Link from "next/link";

export function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="hover:opacity-90 transition">
            <h1 className="text-2xl font-bold tracking-tight">
              Inventory System
            </h1>
          </Link>
          <nav className="flex gap-8">
            <Link
              href="/"
              className="hover:text-blue-100 transition font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/purchase-requests"
              className="hover:text-blue-100 transition font-medium"
            >
              Requests
            </Link>
            <Link
              href="/purchase-requests/create"
              className="hover:text-blue-100 transition font-medium"
            >
              New Request
            </Link>
            <Link
              href="/receive-stock"
              className="hover:text-blue-100 transition font-medium"
            >
              Receive Stock
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 border-t border-gray-200 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p>&copy; 2024 Inventory Allocation System. All rights reserved.</p>
      </div>
    </footer>
  );
}
