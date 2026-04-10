export const getShareTrackEvent = ({
  page,
  target,
}: {
  page: string
  target: string
}) => {
  return ['trackEvent', page, 'Click Share', target]
}
