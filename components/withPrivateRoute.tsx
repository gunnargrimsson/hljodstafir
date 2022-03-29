import React from 'react'
import Router from 'next/router';

const login = '/?redirected=true';

const checkUserAuthentication = () => {
  return { auth: null };
}

export default WrappedComponent => {
  const hocComponent = ({ ...props }) => <WrappedComponent  {...props} />;
  
  hocComponent.getInitialProps = async (context) => {
    const userAuth = await checkUserAuthentication();

    // Are you an authorized user or not?
    if (!userAuth?.auth) {
      // Handle server-side and client-side rendering.
      if (context.res) {
        context.res?.writeHead(302, {
          Location: login,
        });
        context.res?.end();
      } else {
        Router.replace(login);
      }
    } else if (WrappedComponent.getInitialProps) {
      const wrappedProps = await WrappedComponent.getInitialProps({...context, auth: userAuth});
      return { ...wrappedProps, userAuth };
    }

    return { userAuth };
  };

  return hocComponent;
}