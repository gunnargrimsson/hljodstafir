import Error from 'next/error'
import React from 'react'

const error = () => {
  return (
    <Error statusCode={503} />
  )
}

export default error