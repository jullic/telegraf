import { Middleware, MiddlewareFn } from '../middleware'
import Composer from '../composer'
import Context from '../context'
import { MessageTypes } from '../telegram-types'

const { compose } = Composer

export interface SceneOptions<C extends Context> {
  ttl?: number
  handlers: ReadonlyArray<MiddlewareFn<C>>
  enterHandlers: ReadonlyArray<MiddlewareFn<C>>
  leaveHandlers: ReadonlyArray<MiddlewareFn<C>>
}

export class BaseScene<C extends Context = Context> extends Composer<C> {
  id: string
  ttl?: number
  enterHandler: MiddlewareFn<C>
  leaveHandler: MiddlewareFn<C>
  globalListeners?: Partial<Record<MessageTypes, boolean>>

  constructor(
    id: string,
    options?: SceneOptions<C>,
    globalListeners?: Partial<Record<MessageTypes, boolean>>
  ) {
    const opts: SceneOptions<C> & {
      globalListeners?: Partial<Record<MessageTypes, boolean>>
    } = {
      handlers: [],
      enterHandlers: [],
      leaveHandlers: [],
      ...options,
      globalListeners: {
        callback_query: true,
        ...globalListeners,
      },
    }
    super(...opts.handlers)
    this.globalListeners = opts.globalListeners
    this.id = id
    this.ttl = opts.ttl
    this.enterHandler = compose(opts.enterHandlers)
    this.leaveHandler = compose(opts.leaveHandlers)
  }

  enter(...fns: Array<Middleware<C>>) {
    this.enterHandler = compose([this.enterHandler, ...fns])
    return this
  }

  leave(...fns: Array<Middleware<C>>) {
    this.leaveHandler = compose([this.leaveHandler, ...fns])
    return this
  }

  enterMiddleware() {
    return this.enterHandler
  }

  leaveMiddleware() {
    return this.leaveHandler
  }
}

export default BaseScene
