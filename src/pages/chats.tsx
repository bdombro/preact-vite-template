import {setPageMeta} from '@slimr/util'

import {Layout} from '~/layout/layout-dashboard'

/**
 * A demo of route in a route stack. Click "Inner Page" to go deeper down
 */
export default function Chats() {
  setPageMeta({
    title: 'Chats',
    description: 'Chats currently assigned to your team',
  })
  return (
    <Layout>
      <Div
        _display="grid"
        _gridTemplateColumns={['1fr', null, '1fr 1fr 1fr', null, '1fr 1fr 1fr 1fr']}
      >
        <ChatBox />
        <ChatBox />
        <ChatBox />
        <ChatBox />
        <ChatBox />
      </Div>
    </Layout>
  )
}

function ChatBox() {
  return <div style={{background: 'var(--color-primary)'}}>Chat Box</div>
}
