import { faker } from '@faker-js/faker'
import { appendSearchParams } from '../appendSearchParams'

describe('appendSearchParams', () => {
  it('should return the inputted url or pathname if no searchParams are passed', () => {
    const url = faker.internet.url()

    expect(
      appendSearchParams({ urlOrPathname: url, searchParams: undefined })
    ).toEqual(url)
  })

  it('should append the searchParams passed to the url', () => {
    const url = faker.internet.url()

    expect(
      appendSearchParams({
        urlOrPathname: url,
        searchParams: { test: 'test', foo: 'bar' },
      })
    ).toEqual(`${url}?test=test&foo=bar`)
  })

  it('should append an array type searchParam to the url', () => {
    const url = faker.internet.url()

    expect(
      appendSearchParams({
        urlOrPathname: url,
        searchParams: { test: ['test1', 'test2'] },
      })
    ).toEqual(`${url}?test=test1&test=test2`)
  })
})
