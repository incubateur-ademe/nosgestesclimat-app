import os from 'node:os'
import v8 from 'node:v8'

const { heap_size_limit } = v8.getHeapStatistics()
const old_space = v8
  .getHeapSpaceStatistics()
  .find(({ space_name }) => space_name === 'old_space')
const heapSizeInGB = heap_size_limit / (1024 * 1024 * 1024)
const totalMemory = os.totalmem() / (1024 * 1024 * 1024)

console.log(`${heapSizeInGB} GB`)
console.log(`${totalMemory.toFixed(3)} GB`)
console.log(old_space)
