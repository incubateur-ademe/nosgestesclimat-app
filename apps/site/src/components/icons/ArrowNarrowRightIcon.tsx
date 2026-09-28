import { twMerge } from "cn";

export default function ArrowNarrowRightIcon({
  className,
}: {
  className?: string
}) {
  return (
    <svg
      width="16"
      height="13"
      viewBox="0 0 14.4 11.2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={twMerge('inline-block fill-current', className)}
      aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.23431 0.234315C8.54673 -0.0781049 9.05327 -0.0781049 9.36569 0.234315L14.1657 5.03431C14.4781 5.34673 14.4781 5.85327 14.1657 6.16569L9.36569 10.9657C9.05327 11.2781 8.54673 11.2781 8.23431 10.9657C7.92189 10.6533 7.92189 10.1467 8.23431 9.83431L11.6686 6.4H0.8C0.358172 6.4 0 6.04183 0 5.6C0 5.15817 0.358172 4.8 0.8 4.8H11.6686L8.23431 1.36569C7.92189 1.05327 7.92189 0.546734 8.23431 0.234315Z"
      />
    </svg>
  )
}
