export default {
  install(Vue, {
    provideName = 'provideReactive',
    injectName = 'injectReactive',
  } = {}) {
    const {
      provide: mergeProvide,
      inject: mergeInject,
      computed: mergeComputed,
    } = Vue.config.optionMergeStrategies
    Vue.mixin({
      beforeCreate() {
        // Resolve `provideReactive`
        const provide = this.$options[provideName]
        if (provide) {
          const context = Object.keys(provide).reduce((context, key) => {
            context[key] = undefined
            return context
          }, {})
          const reactiveContext = Vue.observable(context)
          // this.$_reactiveContext = reactiveContext
          const provided = {
            $_reactive: reactiveContext,
          }
          this.$options.provide = mergeProvide(
            this.$options.provide,
            provided,
            this,
            'provide',
          )
          this.$once('hook:created', () => {
            const unwatchFns = []
            for (const key of Object.keys(provide)) {
              const unwatch = this.$watch(provide[key], function (value, oldValue) {
                if (value !== oldValue) reactiveContext[key] = value
              }, { immediate: true })
              unwatchFns.push(unwatch)
            }
            this.$on('hook:beforeDestroy', () => {
              unwatchFns.forEach(unwatch => unwatch())
            })
          })
        }
        // Resolve `injectReactive`
        let inject = this.$options[injectName]
        if (inject) {
          if (Array.isArray(inject)) {
            inject = inject.reduce((object, key) => {
              object[key] = { from: key }
              return object
            }, {})
          }
          const injected = {
            $_reactive: {
              from: '$_reactive',
              default: undefined,
            },
          }
          this.$options.inject = mergeInject(
            this.$options.inject,
            injected,
            this,
            'inject',
          )
          const computed = Object.keys(inject).reduce((object, key) => {
            object[key] = function () {
              const value = inject[key]
              if (this.$_reactive && (value.from in this.$_reactive)) {
                return this.$_reactive[value.from]
              }
              return value.default
            }
            return object
          }, {})
          this.$options.computed = mergeComputed(
            this.$options.computed,
            computed,
            this,
            'computed',
          )
        }
      },
    })
  },
}
