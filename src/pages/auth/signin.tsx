import { GetServerSidePropsContext, NextPageContext } from 'next';
import { BuiltInProviderType } from 'next-auth/providers';
import { ClientSafeProvider, getProviders, LiteralUnion, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const signin = ({
	providers,
}: {
	providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>;
}) => {
	const { data: session } = useSession();
	const router = useRouter();

	return (
		<div className='bg-stone-200 h-screen w-full flex place-content-center place-items-center'>
			{Object.values(providers).map((provider) => (
				<div key={provider.name}>
					<button
						className='font-bold bg-white px-3 py-1 rounded-sm ring-1 ring-black hover:text-white hover:bg-black'
						onClick={() => signIn(provider.id, { callbackUrl: router.query.callbackUrl.toString() })}
					>
						Sign in with {provider.name} or {provider.id}
					</button>
				</div>
			))}
		</div>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const providers = await getProviders();
	return {
		props: { providers },
	};
}

export default signin;
