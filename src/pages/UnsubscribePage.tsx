import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already'>('loading');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  
  useEffect(() => {
    const unsubscribe = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid unsubscribe link. Please use the link from your email.');
        return;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('newsletter-unsubscribe', {
          body: { token }
        });
        
        if (error) {
          setStatus('error');
          setMessage('Failed to process unsubscribe request. Please try again.');
          return;
        }
        
        if (data?.success) {
          setEmail(data.email || '');
          if (data.message?.includes('already')) {
            setStatus('already');
            setMessage('You have already been unsubscribed from our newsletter.');
          } else {
            setStatus('success');
            setMessage('You have been successfully unsubscribed from our newsletter.');
          }
        } else {
          setStatus('error');
          setMessage(data?.message || 'Failed to unsubscribe. Please try again.');
        }
      } catch (err) {
        console.error('Unsubscribe error:', err);
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
      }
    };
    
    unsubscribe();
  }, [searchParams]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto text-[#009fe3] animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing your request...
            </h2>
            <p className="text-gray-600">
              Please wait while we unsubscribe you from our newsletter.
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Successfully Unsubscribed
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            {email && (
              <p className="text-sm text-gray-500 mb-6">
                Email: {email}
              </p>
            )}
            <div className="space-y-3">
              <p className="text-gray-600">
                We're sorry to see you go! You will no longer receive our newsletter updates.
              </p>
              <p className="text-sm text-gray-500">
                If you unsubscribed by mistake, you can always sign up again.
              </p>
              <div className="pt-4 space-y-2">
                <Link
                  to="/"
                  className="block w-full bg-[#009fe3] text-white py-2 px-4 rounded-lg hover:bg-[#0088cc] transition-colors duration-200"
                >
                  Return to Homepage
                </Link>
                <Link
                  to="/#email-signup"
                  className="block w-full border border-[#009fe3] text-[#009fe3] py-2 px-4 rounded-lg hover:bg-[#009fe3] hover:text-white transition-colors duration-200"
                >
                  Sign Up Again
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {status === 'already' && (
          <div className="text-center">
            <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Already Unsubscribed
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            {email && (
              <p className="text-sm text-gray-500 mb-6">
                Email: {email}
              </p>
            )}
            <div className="pt-4 space-y-2">
              <Link
                to="/"
                className="block w-full bg-[#009fe3] text-white py-2 px-4 rounded-lg hover:bg-[#0088cc] transition-colors duration-200"
              >
                Return to Homepage
              </Link>
              <Link
                to="/#email-signup"
                className="block w-full border border-[#009fe3] text-[#009fe3] py-2 px-4 rounded-lg hover:bg-[#009fe3] hover:text-white transition-colors duration-200"
              >
                Sign Up for Newsletter
              </Link>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unsubscribe Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-2">
              <Link
                to="/"
                className="block w-full bg-[#009fe3] text-white py-2 px-4 rounded-lg hover:bg-[#0088cc] transition-colors duration-200"
              >
                Return to Homepage
              </Link>
              <a
                href="mailto:support@backreform.co.uk?subject=Unsubscribe%20Request"
                className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Reform UK
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;