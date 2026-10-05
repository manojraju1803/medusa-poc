import { Label, RadioGroup, Text, clx } from "@modules/common/components/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-y-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <Text className="text-xs font-bold uppercase tracking-wider text-[#0f172a]">
          {title}
        </Text>
      </div>
      <RadioGroup data-testid={dataTestId} className="flex flex-col gap-1.5">
        {items?.map((i) => {
          const isSelected = i.value === value
          return (
            <div
              key={i.value}
              onClick={() => handleChange(i.value)}
              className={clx(
                "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all",
                {
                  "bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD] font-bold shadow-xs":
                    isSelected,
                  "text-[#4b5563] hover:bg-gray-50 hover:text-[#0f172a] border border-transparent":
                    !isSelected,
                }
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={clx(
                    "w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors",
                    {
                      "border-[#1C94D2] bg-[#1C94D2]": isSelected,
                      "border-gray-300 bg-white": !isSelected,
                    }
                  )}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <RadioGroup.Item
                  checked={isSelected}
                  onChange={() => handleChange(i.value)}
                  className="hidden peer"
                  id={i.value}
                  value={i.value}
                />
                <Label
                  htmlFor={i.value}
                  className="cursor-pointer select-none text-xs"
                  data-testid="radio-label"
                  data-active={isSelected}
                >
                  {i.label}
                </Label>
              </div>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
