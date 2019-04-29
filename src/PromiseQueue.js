const p = cb => new Promise((fulfill, reject) => cb(fulfill, reject))

export default class PromiseQueue {

  stack = []

  add(fn) {
    this.stack.push(fn)
    return this
  }

  addPromise(fn) {
    this.stack.push(() => p(fn))
    return this
  }

  run() {
    return this.stack.reduce((prev, fn) => {
      return prev.then(fn)
    }, Promise.resolve())
  }

}