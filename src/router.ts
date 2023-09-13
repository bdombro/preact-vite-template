import {Router} from '@slimr/router'

import Index from './pages/index'
import Login from './pages/login'
import NotFound from './pages/not-found'
import StackTest from './pages/stack-test'

// FIXME: maybe if component = () => Home(), we could avoid cyclic dependencies
export const router = new Router(
  {
    index: {
      component: Index,
      path: '/',
    },
    login: {
      component: Login,
      path: '/login',
    },
    stack1: {
      isStack: true,
      component: StackTest,
      path: '/stack1',
    },
    stack1Inner: {
      exact: false,
      component: StackTest,
      path: '/stack1',
    },
    notFound: {
      exact: false,
      component: NotFound,
      path: '/',
    },
  },
  {
    scrollElSelector: 'main',
  }
)
