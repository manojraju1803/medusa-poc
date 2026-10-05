import { Disclosure } from "@headlessui/react"
import { Badge, Button, clx } from "@modules/common/components/ui"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 transition-all hover:border-gray-300" data-testid={dataTestid}>
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            {label}
          </span>
          <div className="text-sm font-semibold text-[#0f172a]" data-testid="current-info">
            {currentInfo}
          </div>
        </div>
        <div>
          <Button
            variant="secondary"
            className={clx(
              "h-8 px-3 text-xs font-semibold rounded-xl border transition-all shadow-xs",
              state
                ? "bg-gray-200 text-gray-700 border-gray-300"
                : "text-[#1C94D2] border-[#1C94D2] hover:bg-[#1C94D2] hover:text-white"
            )}
            onClick={handleToggle}
            type={state ? "reset" : "button"}
            data-testid="edit-button"
            data-active={state}
          >
            {state ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Success state */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <div className="mt-3 p-3 rounded-xl bg-[#dcfce7] border border-[#bbf7d0] text-xs font-semibold text-[#166534] flex items-center gap-2">
            <span>✓</span>
            <span>{label} updated successfully</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      {/* Error state  */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        </Disclosure.Panel>
      </Disclosure>

      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-visible",
            {
              "max-h-[1000px] opacity-100": state,
              "max-h-0 opacity-0": !state,
            }
          )}
        >
          <div className="flex flex-col gap-y-3 pt-4 mt-3 border-t border-gray-200/80">
            <div>{children}</div>
            <div className="flex items-center justify-end mt-2">
              <Button
                isLoading={pending}
                className="w-full sm:w-auto px-6 h-9 bg-[#1C94D2] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                type="submit"
                data-testid="save-button"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo
