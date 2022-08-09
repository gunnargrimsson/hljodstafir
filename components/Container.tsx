import Link from 'next/link'
import React, { ReactNode } from 'react'

const Container = ({ children }: { children: ReactNode }) => {
  return (
    <div className='flex h-screen flex-col'>
			<div className='w-full px-5 py-10'>
				<Link href={'/'}>
					<div className='text-2xl font-semibold cursor-pointer select-none'>🎼 Hljóðstafir</div>
				</Link>
			</div>
      {children}
    </div>
  )
}

export default Container