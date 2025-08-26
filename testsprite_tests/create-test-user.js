// Create test user for authentication testing
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function createTestUser() {
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    try {
        console.log('Creating test user with email:', testEmail);
        
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Test user created successfully!');
            console.log('User ID:', data.user?.id);
            console.log('Email:', data.user?.email);
            
            // Now test login
            console.log('\nTesting login...');
            const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPassword
                })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginResponse.ok && loginData.access_token) {
                console.log('✅ Login test successful!');
                console.log('Access token:', loginData.access_token ? 'Present' : 'Missing');
                return true;
            } else {
                console.log('❌ Login test failed:', loginData.error?.message);
                return false;
            }
        } else {
            console.log('❌ Failed to create test user:', data.error?.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

createTestUser().then(success => {
    process.exit(success ? 0 : 1);
});
