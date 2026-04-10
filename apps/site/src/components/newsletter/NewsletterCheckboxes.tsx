import CheckboxInput from '@/design-system/inputs/CheckboxInput'
import Emoji from '@/design-system/utils/Emoji'
import type { ListIds, Newsletters } from '@/helpers/server/model/newsletter'

export default function NewsletterCheckBoxes({
  defaultListIds,
  newsletters,
}: {
  defaultListIds?: ListIds
  newsletters: Newsletters
}) {
  return (
    <section className="flex flex-col gap-4">
      {newsletters.map(({ id, title, description, brevoId, emoji }) => (
        <div className="w-xl max-w-full" key={id}>
          <CheckboxInput
            name={String(brevoId)}
            label={
              <span className="text-lg font-bold">
                {title} <Emoji>{emoji}</Emoji>
              </span>
            }
            aria-describedby={`newsletter-${id}-description`}
            disableSubmitOnEnter
            defaultChecked={defaultListIds?.includes(brevoId) ?? false}
          />
          <p id={`newsletter-${id}-description`} className="mt-2 mb-0 pl-6">
            {description}
          </p>
        </div>
      ))}
    </section>
  )
}
