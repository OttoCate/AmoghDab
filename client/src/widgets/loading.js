import './loading.css'

const Loading = () => {
  return (
    <div
      style={{
        widht: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="loader"></div>
    </div>
  )
}

export default Loading
