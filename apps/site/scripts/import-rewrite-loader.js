/** Allows Next.js to resolve correctly esm `imports something from './something.js'` to their corresponding `.ts` or `.tsx` files */
export default function stripExtensions(source) {
  return source.replaceAll(/(from\s+["'].*?)(\.js)(['"];?)$/gm, '$1$3')
}
