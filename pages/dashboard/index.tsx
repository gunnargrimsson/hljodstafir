import React from 'react';
import withPrivateRoute from '../../components/withPrivateRoute';

const Dashboard = () => {
  return <div>Dashboard</div>;
};

Dashboard.getInitialProps = async (ctx) => {
  console.log('ctx', ctx)
  return {};
};

export default withPrivateRoute(Dashboard);