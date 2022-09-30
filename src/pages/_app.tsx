import '../styles/globals.css'
import nProgress from 'nprogress';
import Router from 'next/router';
import '../styles/nprogress.css';
import { SessionProvider } from "next-auth/react"
import { Session } from 'next-auth';
import type { AppProps } from 'next/app';
import { extendedSocket } from '../interfaces';

nProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false,
});

Router.events.on('routeChangeStart', () => nProgress.start());
Router.events.on('routeChangeComplete', () => nProgress.done());
Router.events.on('routeChangeError', () => nProgress.done());

interface InitialProps extends AppProps {
  session: Session;
}

export default function MyApp({ Component, pageProps, session }: InitialProps) {
  return <SessionProvider session={session}><Component {...pageProps} /></SessionProvider>
}
