import { twMerge } from 'tailwind-merge'

export default function WaterDropIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('fill-default inline-block stroke-[1.5]', className)}
      aria-hidden="true">
      <path d="M5.46429 1.39375C5.57143 1.16875 5.78571 1 6 1C6.21429 1 6.42857 1.16875 6.48214 1.39375C7.28571 4.20625 9 4.9375 9 6.90625C9 8.65 7.66071 10 6 10C4.33929 10 3 8.65 3 6.90625C3 4.9375 4.66071 4.20625 5.46429 1.39375Z" />
    </svg>
  )
}
