import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import './index.css';
import App from './App.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || 'pk_test_bmF0dXJhbC1veC0xOTA0LmNsZXJrLmFjY291bnRzLmRldiQ'} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>
);
