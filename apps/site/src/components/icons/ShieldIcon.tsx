import { twMerge } from 'tailwind-merge'

export default function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="22"
      viewBox="0 0 18 22"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge(
        'fill-secondary-700 inline-block stroke-none stroke-2',
        className
      )}
      aria-hidden="true"
      fill="none">
      <path d="M9 0L0 4V10C0 15.5 3.8 20.7 9 22C14.2 20.7 18 15.5 18 10V4L9 0ZM13 14.8C13 15.4 12.4 16 11.7 16H6.2C5.6 16 5 15.4 5 14.7V11.2C5 10.6 5.6 10 6.2 10V7.5C6.2 6.1 7.6 5 9 5C10.4 5 11.8 6.1 11.8 7.5V8H10.5V7.5C10.5 6.7 9.8 6.2 9 6.2C8.2 6.2 7.5 6.7 7.5 7.5V10H11.8C12.4 10 13 10.6 13 11.3V14.8Z" />
    </svg>
  )
}
