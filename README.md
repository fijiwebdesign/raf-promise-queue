# RequestAnimationFrame Promise Queue

A Promise based Queue that uses RequestAnimationFrame to execute each task. 
Can be used as alternative to `fastdom` with more control of batch, sequential and parallel execution by using promises

## Controlling execution

* `RafPromiseQueue.add(() => { .... })` will add sequentially to the queue. However execution is async, thus precedence of execution is not defined. 

* `RafPromiseQueue.addPromise((fulfill, reject) => { .... })` will chain a promise within the queue and provide your callback function with `fulfill, reject` functions as parameters exactly like `new Promise((fulfill, reject) => { ... })`. This ensures your callback is executed async yet in sequence thus providing precedence of execution. 

* `RafPromiseQueue.run()` returns a promise of all chained Promises in the queue. This allows chaining batch operations in a queue with another queue, or executing queues in parallel. 

* `RafPromiseQueue.addPromise` is equivalent to returning a Promise from `RafPromiseQueue.add(() => { .... })`. 
Example: `RafPromiseQueue.add(async () => await someSequentialAsyncTask())` or `RafPromiseQueue.add(() => new Promise(fulfill => someSequentialAsyncTask(fulfill)))`

## Controlling errors

*  `RafPromiseQueue.addPromise((fulfill, reject) => { .... })` executes within a Promise and thus errors can be caught on the queue level with `RafPromiseQueue.run().catch(error => {})`
* You can catch on each queue, or combined queues `queue1.run().then(queue2.run()).catch(error => {})`
* The queue always returns a promise so you can use error catching promises offer.


## Example

```
import { RafPromiseQueue } from 'raf-promise-queue'

const queue1 = new RafPromiseQueue()
queue1.addPromise(fulfill => setTimeout(() => {
  console.log('Task 1 complete')
  fulfill()
}))
queue1.add(() => setTimeout(() => {
  console.log('Task 2 complete')
}))
queue1.add(() => {
  console.log('Task 3 complete')
})

const queue2 = new RafPromiseQueue()
queue2.add(() => {
  console.log('Task 4 complete')
})

queue1.run().then(queue2.run())
  .catch(error => console.log(error.message))


```

This will await task 1, then execute task 2 and task 3 in parallel. 

Result will be: 

```
Task 1 complete
Task 3 complete
Task 2 complete
Task 4 complete
```

If we change the precedence of batch operations per queue.

```
queue2.run().then(queue1.run())
```

Result will be: 

```
Task 4 complete
Task 1 complete
Task 3 complete
Task 2 complete
```

Or we can run them in parallel

```
Promise.all(queue1.run(), queue2.run())
```

Result will be similar to: 

```
Task 1 complete
Task 3 complete
Task 4 complete
Task 2 complete
```

## Install 

```
yarn add raf-promise-queue
```

## Inspiration

https://github.com/nerevar/rafQueue - Library for stretching heavy js operations in time using request Animation Frame
https://github.com/wilsonpage/fastdom - Eliminates layout thrashing by batching DOM measurement and mutation tasks


## Example Implementation of `fastdom` 

RafPromiseQueue is a lower level promise based queue and thus supports sequential batching operations such as the `measure()` and `mutate()` queues offered by `fastdom`

```
import { RafPromiseQueue } from 'raf-promise-queue'

const mutate = new RafPromiseQueue()
mutate.addPromise(fulfill => {
  console.log('Mutate 1 complete')
  fulfill()
}).addPromise(fulfill => {
  console.log('Mutate 2 complete')
  fulfill()
})

const measure = new RafPromiseQueue()
measure.addPromise(fulfill => {
  console.log('Measure 1 complete')
  fulfill()
}).addPromise(fulfill => {
  console.log('Measure 2 complete')
  fulfill()
})

measure.run()
  .then(mutate.run())
  .then(() => console.log('completed measure then mutate'))

```

Result will be: 

```
Measure 1 complete
Measure 2 complete
Mutate 1 complete
Mutate 2 complete
```

## Todo

* Add unit tests
* More execution control
