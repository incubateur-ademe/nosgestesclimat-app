// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Carousel from './Carousel'

const meta: Meta<typeof Carousel> = {
  title: 'Design System/Carousel',
  component: Carousel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    innerClassName: {
      control: 'text',
      description: 'CSS class applied to the inner Swiper container',
    },
  },
}

export default meta
type Story = StoryObj<typeof Carousel>

const SampleCard = ({
  color,
  label,
}: {
  color: string
  label: string
}) => (
  <div
    className="flex h-40 items-center justify-center rounded-xl p-6 text-lg font-bold text-white"
    style={{ backgroundColor: color }}>
    {label}
  </div>
)

export const Default: Story = {
  args: {
    locale: 'fr',
    children: [
      <SampleCard key="1" color="#4F46E5" label="Slide 1" />,
      <SampleCard key="2" color="#7C3AED" label="Slide 2" />,
      <SampleCard key="3" color="#DB2777" label="Slide 3" />,
      <SampleCard key="4" color="#DC2626" label="Slide 4" />,
    ],
  },
}

export const TwoSlides: Story = {
  args: {
    locale: 'fr',
    children: [
      <SampleCard key="1" color="#059669" label="Première" />,
      <SampleCard key="2" color="#0891B2" label="Deuxième" />,
    ],
  },
}

export const SingleSlide: Story = {
  args: {
    locale: 'fr',
    children: [
      <SampleCard key="1" color="#D97706" label="Seule slide" />,
    ],
  },
}
