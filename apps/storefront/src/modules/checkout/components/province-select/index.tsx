import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { ChangeEvent } from "react"
import { INDIAN_STATES } from "./states"

export { INDIAN_STATES, provinceName } from "./states"

const ProvinceSelect = ({
  name,
  countryCode,
  value,
  onChange,
  testId,
}: {
  name: string
  countryCode?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  testId?: string
}) => {
  if (countryCode && countryCode.toLowerCase() !== "in") {
    return (
      <Input
        label="State / Province"
        name={name}
        autoComplete="address-level1"
        value={value}
        onChange={onChange}
        data-testid={testId}
      />
    )
  }

  // A saved value outside the list (e.g. an old "KA") is dropped so the buyer
  // has to pick a state the tax provider understands.
  const known = INDIAN_STATES.some((s) => s.code === value)

  return (
    <NativeSelect
      name={name}
      placeholder="State"
      value={known ? value : ""}
      onChange={onChange}
      required
      data-testid={testId}
    >
      {INDIAN_STATES.map((s) => (
        <option key={s.code} value={s.code}>
          {s.name}
        </option>
      ))}
    </NativeSelect>
  )
}

export default ProvinceSelect
