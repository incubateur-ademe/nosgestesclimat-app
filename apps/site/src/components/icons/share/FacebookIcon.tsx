import { twMerge } from 'tailwind-merge'

export default function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('inline-block stroke-2', className)}
      aria-hidden="true">
      <g clipPath="url(#clip0_54686_8474)">
        <path
          d="M9.31037 13V9.06238H10.6724L10.9316 7.43353H9.31037V6.37662C9.31037 5.93082 9.53688 5.4965 10.263 5.4965H11V4.1099C11 4.1099 10.3309 4 9.69151 4C8.35626 4 7.48394 4.78026 7.48394 6.19219V7.43353H6V9.06238H7.48394V13H9.31037Z"
          fill="#4949BA"
        />
        <path
          d="M9 0.700195C13.0257 0.700195 16.2998 3.9743 16.2998 8C16.2998 11.8999 13.2271 15.0942 9.375 15.29L9 15.2998H8.7002V15.292C4.81303 15.1342 1.7002 11.9248 1.7002 8C1.7002 3.97479 4.97429 0.700196 9 0.700195ZM9 1.85742C5.61371 1.85742 2.85742 4.61371 2.85742 8C2.85742 11.3863 5.61371 14.1416 9 14.1416C12.3861 14.1413 15.1416 11.3861 15.1416 8C15.1416 4.61365 12.3862 1.85742 9 1.85742Z"
          fill="#4949BA"
          stroke="#4949BA"
          strokeWidth="0.6"
        />
      </g>
      <defs>
        <clipPath id="clip0_54686_8474">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}
