import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const Navbar = () => {
	const { data: session } = useSession();

	const handleSignOut = () => {
		// remove clientInfo from cookies
		document.cookie = 'clientInfo=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		signOut();
	};

	return (
		<nav className='w-full px-5 h-20 bg-zinc-50 flex place-items-center place-content-between'>
			<Link href={'/'}>
				<div className='text-2xl font-semibold cursor-pointer select-none flex place-items-center uppercase gap-2'>
					<Image src={'/images/android-chrome-192x192.png'} width={40} height={40} />
					Hljóðstafir
				</div>
			</Link>
			<div className='flex flex-row gap-2'>
				{session && (
					<div className='flex flex-row gap-4 place-items-center'>
						{session?.user?.image && <Image className='rounded-full' width={32} height={32} src={session.user.image} />}
						<div className='font-bold underline'>{session?.user?.email}</div>
						<button
							className='font-bold bg-red-400 px-3 py-1 rounded-sm ring-1 text-black ring-black hover:text-white hover:bg-black'
							onClick={handleSignOut}
						>
							Sign out
						</button>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
