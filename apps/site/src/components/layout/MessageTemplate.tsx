import { type ReactNode } from 'react'

export default function MessageTemplate({
  title,
  description,
  buttonElement,
}: {
  title: ReactNode
  description: ReactNode
  buttonElement: ReactNode
}) {
  return (
    <>
      <h1 className="mb-4 px-3 text-lg md:px-0 md:text-xl">{title}</h1>

      <div className="mb-11 px-3 md:px-0">{description}</div>

      <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
        {buttonElement}
      </div>
    </>
  )
}
