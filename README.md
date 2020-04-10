# vue-reactive-context

[![npm](https://img.shields.io/npm/v/vue-reactive-context.svg)](https://www.npmjs.com/package/vue-reactive-context)

Reactive provide/inject for vue@2

## Installation

```shell
npm install vue-reactive-provide
# or
yarn add vue-reactive-provide
```

## Usage

```javascript
import Vue from 'vue'
import VueReactiveContext from 'vue-reactive-context'

Vue.use(VueReactiveContext)

// or

Vue.use(VueReactiveContext, {
  provideName: 'provideReactive',
  injectName: 'injectReactive',
})
```

Generally you can simply replace `provide` and `inject` options in your component with `provideReactive` and `injectReative`. It will works just like what you are thinking of.

```javascript
// in parent component file
export default {
  // ...
  provideReactive() {
    return {
      time: this.time
    }
  },
  data() {
    return {
      time: new Date()
    }
  },
  created() {
    setTimeout(() => {
      this.time = new Date()
    }, 1000)
  },
}

// in child component file
export default {
  injectReative: ['time'],
  template: '<span>{{ time.getSeconds() }}</span>'
}

```

## How it works

This plugin is implemented in `provide`, `inject` and `computed` in vue@2. Since the reative context works like `computed` properties, it won't make additional performance overhead significantly.

## License

MIT. See [LICENSE](./LICENSE).
