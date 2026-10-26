// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import Button from './Button'
import type { ButtonColor, ButtonSize, ButtonVariant } from './buttonStyles'

const variants: ButtonVariant[] = ['filled', 'outlined', 'text', 'link']
const colors: ButtonColor[] = ['primary', 'red']
const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

const meta: Meta<typeof Button> = {
  title: 'Design System/Buttons/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: variants,
      description: 'The variant of the button',
    },
    color: {
      control: 'select',
      options: colors,
      description: 'The color of the button',
    },
    size: {
      control: 'select',
      options: sizes,
      description: 'The size variant of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description:
        'Whether the button is in a loading state (shows a spinner and auto-disables)',
    },
    onClick: {
      action: 'clicked',
      description: 'Optional click handler',
    },
    showLoadingOnClickWhilePending: {
      control: 'boolean',
      description:
        'Auto-disables the button after the first click to prevent double submission',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    color: 'primary',
    size: 'md',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'outlined',
    size: 'md',
  },
}

export const Red: Story = {
  args: {
    children: 'Red Button',
    color: 'red',
    size: 'md',
  },
}

export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
    size: 'md',
  },
}

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
}

export const LoadingSecondary: Story = {
  args: {
    children: 'Loading Secondary',
    variant: 'outlined',
    loading: true,
  },
}

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-10 p-4">
      {colors.map((color) => (
        <section key={color}>
          <h2 className="mb-4 text-xl font-bold capitalize">{color}</h2>
          <div className="flex flex-col gap-4">
            {variants.map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-3">
                <span className="w-20 text-sm font-bold capitalize">
                  {variant}
                </span>
                {sizes.map((size) => (
                  <Button
                    {...args}
                    key={size}
                    variant={variant}
                    color={color}
                    size={size}>
                    {size}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Every combination of variant, color and size. The disabled and loading controls apply to all buttons.',
      },
    },
  },
}

export const ClickOnce: Story = {
  args: {
    children: 'Click me once',
    showLoadingOnClickWhilePending: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'After the first click, the button auto-disables itself to prevent duplicate submissions.',
      },
    },
  },
}
