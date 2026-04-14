'use client'

import Trans from '@/components/translation/trans/TransClient'
import { baseClassNames, sizeClassNames } from '@/design-system/buttons/Button'
import type { GesturesType } from '@/types/landing-page'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

export default function GestureSelector({
  gestures,
}: {
  gestures: GesturesType
}) {
  const gesturesKeys = Object.keys(gestures)

  const [selectedCategory, setSelectedCategory] = useState<string>(
    gesturesKeys[0]
  )

  if (!gesturesKeys?.length) return null

  return (
    <>
      <div className="flex-1 text-left">
        <ul className="mb-8 flex gap-1 overflow-x-auto overflow-y-visible px-1 py-2 md:overflow-x-hidden md:py-0">
          {Object.keys(gestures).length > 1 &&
            Object.keys(gestures).map((categoryName: string) => (
              <li key={categoryName}>
                <button
                  className={twMerge(
                    baseClassNames,
                    sizeClassNames.xs,
                    'border-primary-100 bg-primary-50 text-primary-800 hover:bg-primary-100 focus:ring-primary-700 my-1 border-2 transition-colors focus:ring-2 focus:ring-offset-3 focus:outline-hidden',
                    selectedCategory === categoryName &&
                      'border-primary-500 bg-primary-100 text-primary-800'
                  )}
                  onClick={() => setSelectedCategory(categoryName)}>
                  <Trans>{categoryName}</Trans>
                </button>
              </li>
            ))}
        </ul>

        <div
          className="relative"
          style={{
            height: `${
              gestures[selectedCategory].gestureList?.length
                ? gestures[selectedCategory].gestureList?.length * 70
                : 120
            }px`,
          }}>
          <AnimatePresence mode="wait">
            <motion.ul
              key={selectedCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute flex w-full flex-1 flex-col gap-6">
              {gestures[selectedCategory].gestureList?.map((gesture, index) => (
                <li
                  key={`gesture-${index}`}
                  className="text-primary-600 flex items-baseline gap-1 text-sm font-bold md:text-lg">
                  <Trans>{gesture}</Trans>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex w-[400px] max-w-full justify-center md:justify-end">
          {gestures[selectedCategory].imageSrc && (
            <Image
              src={gestures[selectedCategory].imageSrc}
              alt=""
              width="400"
              height="400"
              className="w-auto object-contain px-4"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
