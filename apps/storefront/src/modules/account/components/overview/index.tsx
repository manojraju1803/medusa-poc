import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import OrderCard from "../order-card"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0
  const ordersCount = orders?.length || 0

  return (
    <div className="flex flex-col gap-8" data-testid="overview-page-wrapper">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1
              className="text-xl sm:text-2xl font-bold text-[#0f172a]"
              data-testid="welcome-message"
              data-value={customer?.first_name}
            >
              Welcome, {customer?.first_name || "Partner"}
            </h1>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#F4FBEA] border border-[#D4EDAB] px-2.5 py-0.5 rounded-full">
              ✓ Verified B2B
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-1">
            Manage your industrial ingredient orders, delivery addresses, and GST billing profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <span>+ Order Ingredients</span>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Metrics & Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Profile Completion
            </span>
            <span className="text-lg">🏢</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="text-2xl font-extrabold text-[#0f172a]"
                data-testid="customer-profile-completion"
                data-value={profileCompletion}
              >
                {profileCompletion}%
              </span>
              <span className="text-xs text-[#64748b]">KYC Ready</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#1C94D2] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
          <LocalizedClientLink
            href="/account/profile"
            className="text-xs font-semibold text-[#1C94D2] hover:underline"
            data-testid="profile-link"
          >
            Edit Profile & GST →
          </LocalizedClientLink>
        </div>

        {/* Saved Addresses Card */}
        <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Delivery Locations
            </span>
            <span className="text-lg">📍</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-extrabold text-[#0f172a]"
              data-testid="addresses-count"
              data-value={addressCount}
            >
              {addressCount}
            </span>
            <span className="text-xs text-[#64748b]">Saved Hubs</span>
          </div>
          <LocalizedClientLink
            href="/account/addresses"
            className="text-xs font-semibold text-[#1C94D2] hover:underline"
            data-testid="addresses-link"
          >
            Manage Addresses →
          </LocalizedClientLink>
        </div>

        {/* Purchase Orders Card */}
        <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Total Orders
            </span>
            <span className="text-lg">📦</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#0f172a]">
              {ordersCount}
            </span>
            <span className="text-xs text-[#64748b]">Invoices</span>
          </div>
          <LocalizedClientLink
            href="/account/orders"
            className="text-xs font-semibold text-[#1C94D2] hover:underline"
            data-testid="orders-link"
          >
            View Order History →
          </LocalizedClientLink>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0f172a]">
            Recent Purchase Orders
          </h2>
          {orders && orders.length > 0 && (
            <LocalizedClientLink
              href="/account/orders"
              className="text-xs font-semibold text-[#1C94D2] hover:underline"
            >
              View All ({orders.length}) →
            </LocalizedClientLink>
          )}
        </div>

        <div className="flex flex-col gap-4" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 3).map((order) => {
              return (
                <div key={order.id} data-testid="order-wrapper" data-value={order.id}>
                  <OrderCard order={order} />
                </div>
              )
            })
          ) : (
            <div
              className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center flex flex-col items-center gap-3"
              data-testid="no-orders-message"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xl">
                📦
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#0f172a]">
                  No Orders Placed Yet
                </span>
                <span className="text-xs text-[#64748b] max-w-sm mt-1">
                  Start sourcing bulk raw materials, cocoa, dairy, or botanical extracts directly from verified manufacturers.
                </span>
              </div>
              <LocalizedClientLink
                href="/store"
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-bold transition-all shadow-xs"
              >
                Browse Ingredient Catalog →
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0
  if (!customer) return 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )
  if (billingAddress) count++
  return Math.round((count / 4) * 100)
}

export default Overview
