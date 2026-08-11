import { twMerge } from 'tailwind-merge'

export default function AnimatedCheckIcon({
  className,
  delay = 0.2,
  ...props
}: {
  className?: string
  delay?: number
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={twMerge('inline-block', className)}
      aria-hidden="true"
      {...props}>
      <style>{`
        .check-path {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: draw-check 0.6s ease-in-out forwards;
          animation-delay: ${delay}s;
        }
        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <path className="check-path" d="M4 12L9 17L20 6" />
    </svg>
  )
}
