// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import { motion } from 'framer-motion'
import ScrollReveal from './ScrollReveal'

const meta: Meta<typeof ScrollReveal> = {
  title: 'Design System/ScrollReveal',
  component: ScrollReveal,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'CSS class applied to the wrapper div',
    },
  },
}

export default meta
type Story = StoryObj<typeof ScrollReveal>

const Card = ({ label }: { label: string }) => (
  <div className="flex h-24 w-48 items-center justify-center rounded-xl bg-primary-700 p-4 font-bold text-white shadow-lg">
    {label}
  </div>
)

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Cards slide in from the right when scrolled into view. */
export const SlideFromRight: Story = {
  args: {
    children: (inView: boolean) => (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={inView ? { opacity: 1, x: 0 } : undefined}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex gap-4">
        <Card label="Témoignage 1" />
        <Card label="Témoignage 2" />
        <Card label="Témoignage 3" />
      </motion.div>
    ),
  },
}

/** Cards slide up from below when scrolled into view. */
export const SlideFromBottom: Story = {
  args: {
    children: (inView: boolean) => (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex gap-4">
        <Card label="Étape 1" />
        <Card label="Étape 2" />
        <Card label="Étape 3" />
      </motion.div>
    ),
  },
}

/** Staggered cards with a container variant for the render-prop pattern. */
export const StaggeredCards: Story = {
  render: () => {
    const containerVariants = {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 },
      },
    }

    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: 'easeOut' as const },
      },
    }

    return (
      <ScrollReveal>
        {(inView) => (
          <motion.div
            className="flex gap-4"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}>
            {['Organisation', 'Individu', 'Collectif'].map((label) => (
              <motion.div key={label} variants={cardVariants}>
                <Card label={label} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </ScrollReveal>
    )
  },
}

/** Fade only — no translation. */
export const FadeOnly: Story = {
  args: {
    children: (inView: boolean) => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : undefined}
        transition={{ duration: 0.8 }}
        className="flex gap-4">
        <Card label="Texte 1" />
        <Card label="Texte 2" />
      </motion.div>
    ),
  },
}
