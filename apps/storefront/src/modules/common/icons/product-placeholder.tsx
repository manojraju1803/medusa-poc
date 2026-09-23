import React from "react"

import { IconProps } from "types/icon"

const ProductPlaceholder: React.FC<IconProps> = ({
  size = "44",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <path
        d="M6 15.5L24 6L42 15.5V32.5L24 42L6 32.5V15.5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M6 15.5L24 25L42 15.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M24 25V42"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.35"
      />
      <path
        d="M15 10.5L33 20.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  )
}

export default ProductPlaceholder
