import type { PropsWithChildren } from 'react'
import Card from '../layout/Card'

export default function Confirmation({ children }: PropsWithChildren) {
  return (
    <Card
      className={
        'mb-8 inline-block w-[30rem] max-w-full items-start border-none bg-[#F4F5FB] p-8 lg:w-[50%]'
      }>
      {children}
    </Card>
  )
}
