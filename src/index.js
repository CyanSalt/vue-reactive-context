export default {
  install(Vue, {
    provideName = 'provideReactive',
    injectName = 'injectReactive',
    contextPrefix = '$_reactive_',
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
          const provided = Object.keys(provide).reduce((context, key) => {
            const reactiveKey = `${contextPrefix}${key}`
            context[reactiveKey] = Vue.observable({value: undefined})
            return context
          }, {})
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
                if (value !== oldValue) provided[`${contextPrefix}${key}`].value = value
              }, {immediate: true})
              unwatchFns.push(unwatch)
            }
            this.$once('hook:beforeDestroy', () => {
              unwatchFns.forEach(unwatch => unwatch())
            })
          })
        }
        // Resolve `injectReactive`
        let inject = this.$options[injectName]
        if (inject) {
          if (Array.isArray(inject)) {
            inject = inject.reduce((object, key) => {
              object[key] = {from: key}
              return object
            }, {})
          }
          const injected = Object.keys(inject).reduce((context, key) => {
            const reactiveKey = `${contextPrefix}${key}`
            context[reactiveKey] = {from: reactiveKey}
            return context
          }, {})
          this.$options.inject = mergeInject(
            this.$options.inject,
            injected,
            this,
            'inject',
          )
          const computed = Object.keys(inject).reduce((object, key) => {
            object[key] = function () {
              const value = inject[key]
              const reactiveKey = `${contextPrefix}${value.from}`
              return this[reactiveKey] ? this[reactiveKey].value : value.default
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
