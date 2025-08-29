import { Redirect } from 'expo-router';

const StartPage = () => {
  console.log('🔍 StartPage: Redirecting to /chat');
  console.log('🔍 StartPage: Redirect component:', !!Redirect);
  return <Redirect href="/chat" />;
};

export default StartPage; 