import '../styles/globals.css'
import nProgress from 'nprogress';
import Router from 'next/router';
import '../styles/nprogress.css';
import { SessionProvider } from "next-auth/react"
import { Session } from 'next-auth';
import type { AppProps } from 'next/app';
import Head from 'next/head';

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
  return <SessionProvider session={session}>
    <Head>
      <title>Hljóðstafir</title>
      <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
      <link rel="manifest" href="/images/site.webmanifest" />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="theme-color" content="#ffffff" />
    </Head>
    <Component {...pageProps} />
    </SessionProvider>
}
