
class CancellationToken {
  constructor () {
    this.cancelled = false
  }

  throwIfCancelled () {
    if (this.isCancelled()) {
      throw Error('Cancelled!')
    }
  }

  isCancelled () {
    return this.cancelled === true
  }

  cancel () {
    this.cancelled = true
  }
}

export class CancellationTokenSource {
  constructor () {
    this.token = new CancellationToken()
  }

  cancel () {
    this.token.cancel()
  }
}
