import PromiseQueue from './PromiseQueue'

const raf = window.requestAnimationFrame 
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.msRequestAnimationFrame
  || window.oRequestAnimationFrame

export default class RafPromiseQueue extends PromiseQueue {

  add(fn) {
    this.stack.push(() => raf(fn))
    return this
  }

  addPromise(fn) {
    this.stack.push(() => p(done => raf(() => fn(done))))
    return this
  }
}