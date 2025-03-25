import { useEffect } from 'react';

export default function Test() {
  useEffect(() => {
    console.log('Test page loaded!');
  }, []);
  
  return <h1 style={{color: 'red', textAlign: 'center', marginTop: '40px'}}>Test Page</h1>;
} 