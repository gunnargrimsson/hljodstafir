import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

const Navbar = () => {
	const { data: session } = useSession();

	return (
		<nav className='w-full px-5 h-20 bg-zinc-50 flex place-items-center place-content-between'>
			<Link href={'/'}>
				<div className='text-2xl font-semibold cursor-pointer select-none'>🎼 Hljóðstafir</div>
			</Link>
			<div className='flex flex-row gap-2'>
				{session ? (
					<div className='flex flex-row gap-4 place-items-center'>
						{session.user.image && <Image className='rounded-full' width={32} height={32} src={session.user.image} />}
						<div className='font-bold underline'>{session.user.email}</div>
						<button
							className='font-bold bg-sky-300 px-3 py-1 rounded-sm ring-1 ring-black hover:text-white hover:bg-black'
							onClick={() => signOut()}
						>
							Sign out
						</button>
					</div>
				) : (
					<>
						<button
							className='font-bold bg-sky-300 px-3 py-1 rounded-sm ring-1 ring-black hover:text-white hover:bg-black'
							onClick={() => signIn()}
						>
							Sign in
						</button>
					</>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
