import '../styles/globals.css'
import nProgress from 'nprogress';
import Router from 'next/router';
import '../styles/nprogress.css';
import { SessionProvider } from "next-auth/react"

nProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false,
});

Router.events.on('routeChangeStart', () => nProgress.start());
Router.events.on('routeChangeComplete', () => nProgress.done());
Router.events.on('routeChangeError', () => nProgress.done());

function MyApp({ Component, session, pageProps }) {
  return <SessionProvider session={session}><Component {...pageProps} /></SessionProvider>
}

export default MyApp