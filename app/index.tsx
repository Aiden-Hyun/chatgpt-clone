import { Redirect } from 'expo-router';

const StartPage = () => {
  console.log('[StartPage] Rendering redirect to /chat');
  return <Redirect href="/chat" />;
};

export default StartPage; 