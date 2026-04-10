// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from '@storybook/nextjs'
import tailwindConfig from '../../../tailwind.config.js'

// Helper function to determine if text should be light or dark based on background
const getTextColor = (bgColor: string): 'text-white' | 'text-black' => {
  if (!bgColor.startsWith('#')) return 'text-black'
  const color = bgColor.substring(1, 7)
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma > 0.5 ? 'text-black' : 'text-white'
}

const ColorSwatch = ({ name, color }: { name: string; color: string }) => (
  <div
    className="flex h-24 w-full flex-col justify-between rounded-lg p-2 shadow-md"
    style={{ backgroundColor: color }}>
    <span className={`font-bold ${getTextColor(color)}`}>{name}</span>
    <span className={`text-sm ${getTextColor(color)}`}>{color}</span>
  </div>
)

const ColorPalette = ({ colorGroup }: { colorGroup: Record<string, any> }) => {
  return (
    <div className="p-4">
      <h1 className="mb-8 text-4xl font-bold">Palette de couleurs</h1>
      {Object.entries(colorGroup).map(([name, shades]) => (
        <div key={name} className="mb-8">
          <h2 className="mb-4 text-2xl font-bold capitalize">{name}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
            {typeof shades === 'object' ? (
              Object.entries(shades).map(([shade, color]) => (
                <ColorSwatch key={shade} name={shade} color={color as string} />
              ))
            ) : (
              <ColorSwatch name={name} color={shades as string} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const meta: Meta<typeof ColorPalette> = {
  title: 'Design System/Docs/Palette',
  component: ColorPalette,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ColorPalette>

export const Colors: Story = {
  args: {
    colorGroup: tailwindConfig.theme?.extend?.colors ?? {},
  },
}

export const SlatePalette: Story = {
  render: () => (
    <div className="p-4">
      <h1 className="mb-8 text-4xl font-bold">Palette Slate</h1>
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold capitalize">Slate</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-50 p-2 shadow-md">
            <span className="font-bold text-black">50</span>
            <span className="text-sm text-black">bg-slate-50</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-100 p-2 shadow-md">
            <span className="font-bold text-black">100</span>
            <span className="text-sm text-black">bg-slate-100</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-200 p-2 shadow-md">
            <span className="font-bold text-black">200</span>
            <span className="text-sm text-black">bg-slate-200</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-300 p-2 shadow-md">
            <span className="font-bold text-black">300</span>
            <span className="text-sm text-black">bg-slate-300</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-400 p-2 shadow-md">
            <span className="font-bold text-white">400</span>
            <span className="text-sm text-white">bg-slate-400</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-500 p-2 shadow-md">
            <span className="font-bold text-white">500</span>
            <span className="text-sm text-white">bg-slate-500</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-600 p-2 shadow-md">
            <span className="font-bold text-white">600</span>
            <span className="text-sm text-white">bg-slate-600</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-700 p-2 shadow-md">
            <span className="font-bold text-white">700</span>
            <span className="text-sm text-white">bg-slate-700</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-800 p-2 shadow-md">
            <span className="font-bold text-white">800</span>
            <span className="text-sm text-white">bg-slate-800</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-900 p-2 shadow-md">
            <span className="font-bold text-white">900</span>
            <span className="text-sm text-white">bg-slate-900</span>
          </div>
          <div className="flex h-24 w-full flex-col justify-between rounded-lg bg-slate-950 p-2 shadow-md">
            <span className="font-bold text-white">950</span>
            <span className="text-sm text-white">bg-slate-950</span>
          </div>
        </div>
      </div>
    </div>
  ),
}
