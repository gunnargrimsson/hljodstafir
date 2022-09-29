import React, { ReactNode } from 'react';
import Navbar from './navigation/Navbar';

const Container = ({ children }: { children: ReactNode }) => {

	return (
		<div className='flex flex-col h-screen'>
			<Navbar />
			<main className='mb-auto relative min-h-[calc(100vh-5rem)]'>{children}</main>
		</div>
	);
};

export default Container;
