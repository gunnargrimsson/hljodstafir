import Error from 'next/error'

const error = () => {
  return (
    <Error statusCode={503} />
  )
}

export default error