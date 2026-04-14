import { twMerge } from 'tailwind-merge'

export default function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge(
        'fill-default stroke-default inline-block stroke-[1.5]',
        className
      )}
      aria-hidden="true">
      <path
        d="M8 1V15M1 8H15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
