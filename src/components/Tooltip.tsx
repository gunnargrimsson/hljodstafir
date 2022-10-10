import React from 'react'

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip = ({ children, text }: TooltipProps) => {
  return (
    <div className='has-tooltip'>
      {children}
      <span className='tooltip prose w-80 -top-28 font-medium'>
        {text}
      </span>
    </div>
  )
}

export default Tooltip