import { GetServerSidePropsContext } from 'next';
import { BuiltInProviderType } from 'next-auth/providers';
import { ClientSafeProvider, getProviders, LiteralUnion, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Container from '../../components/Container';

const signin = ({
	providers,
}: {
	providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>;
}) => {
	const router = useRouter();
	const { data: session } = useSession();

	if (session) {
		router.push('/');
	}

	const handleSignIn = async (provider: string) => {
		await signIn(provider, { callbackUrl: '/' }).catch((error) => {
			console.log(error);
		});
	}

	return (
		<Container>
			<div className='bg-stone-200 w-full flex flex-1 flex-col place-content-center place-items-center'>
					<h1 className='text-3xl font-bold mb-5'>Please sign in to use Hljóðstafir</h1>
				{Object.values(providers).map((provider) => (
					<div key={provider.name}>
						<button
							className='font-bold bg-white px-3 py-1 rounded-sm ring-1 ring-black hover:text-white hover:bg-black'
							onClick={() => handleSignIn(provider.id)}
						>
							Sign in with {provider.name}
						</button>
					</div>
				))}
			</div>
		</Container>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const providers = await getProviders();
	return {
		props: { providers },
	};
}

export default signin;
