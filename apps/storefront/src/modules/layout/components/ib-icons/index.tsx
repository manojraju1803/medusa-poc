// Small stroke icons used by the site shell and home page.
type IconProps = { className?: string }

const Stroke = ({
  className = "w-4 h-4",
  children,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const p = (d: string) => (
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
)

export const SearchIcon = (props: IconProps) => (
  <Stroke {...props}>{p("M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z")}</Stroke>
)
export const HeartIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M4.3 6.3a4.5 4.5 0 016.4 0L12 7.6l1.3-1.3a4.5 4.5 0 116.4 6.4L12 20.4l-7.7-7.7a4.5 4.5 0 010-6.4z"
    )}
  </Stroke>
)
export const CompareIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
    )}
  </Stroke>
)
export const BagIcon = (props: IconProps) => (
  <Stroke {...props}>{p("M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z")}</Stroke>
)
export const UserIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z")}
  </Stroke>
)
export const ChevronDownIcon = (props: IconProps) => (
  <Stroke {...props}>{p("M19 9l-7 7-7-7")}</Stroke>
)
export const ChevronRightIcon = (props: IconProps) => (
  <Stroke {...props}>{p("M9 5l7 7-7 7")}</Stroke>
)
export const ArrowRightIcon = (props: IconProps) => (
  <Stroke {...props}>{p("M17 8l4 4m0 0l-4 4m4-4H3")}</Stroke>
)
export const CloseIcon = (props: IconProps) => (
  <Stroke {...props}>{p("M6 18L18 6M6 6l12 12")}</Stroke>
)
export const MenuIcon = (props: IconProps) => (
  <Stroke {...props}>{p("M4 6h16M4 12h16M4 18h16")}</Stroke>
)
export const GlobeIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 004 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
    )}
  </Stroke>
)
export const CheckIcon = (props: IconProps) => (
  <Stroke {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </Stroke>
)
export const WarnIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M12 8v4m0 4h.01M10.3 3.7L2.8 17a2 2 0 001.74 3h14.92a2 2 0 001.74-3L13.7 3.7a2 2 0 00-3.4 0z"
    )}
  </Stroke>
)
export const PlayIcon = (props: IconProps) => (
  <svg className={props.className ?? "w-5 h-5"} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)
export const DocIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    )}
  </Stroke>
)
export const BoxIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p("M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4")}
  </Stroke>
)
export const ChartIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    )}
  </Stroke>
)
export const TruckIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
    )}
  </Stroke>
)
export const ShieldIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    )}
  </Stroke>
)
export const LeafIcon = (props: IconProps) => (
  <Stroke {...props}>
    {p(
      "M12 21c4.5-2.5 7-6.3 7-11.5C14.4 9.2 11.3 6.8 9.8 3 6.7 5.3 5 8.2 5 11.3 5 16.1 7.7 19.2 12 21zM12 20V9"
    )}
  </Stroke>
)
