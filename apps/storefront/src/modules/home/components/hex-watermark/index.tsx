// Faint double hexagon, echoing the logo mark, for card image panels. Place
// inside a `relative overflow-hidden group` container.
const HexWatermark = ({ className = "" }: { className?: string }) => (
  <svg
    className={`absolute -right-6 -bottom-8 w-40 h-40 text-[#7aba0c]/15 group-hover:text-[#0077cf]/15 transition-colors duration-500 ${className}`}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
    aria-hidden="true"
  >
    <path d="M50 4l40 23v46L50 96 10 73V27z" />
    <path d="M50 24l23 13v26L50 76 27 63V37z" strokeWidth="4" />
  </svg>
)

export default HexWatermark
