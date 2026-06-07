import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState<string>('正在连接后端...')

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/test')
      .then(res => {
        if (res.data.status === 'success') {
          setMessage(res.data.message)
        }
      })
      .catch(err => {
        setMessage('连接后端失败，请检查后端是否启动！')
        console.error(err)
      })
  }, [])
  //投入tailwand css的怀抱
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Jnove's blog 项目框架</h1>
      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f2f5', borderRadius: '8px' }}>
        <strong>后端回应：</strong> {message}
      </div>
    </div>
  )
}

export default App