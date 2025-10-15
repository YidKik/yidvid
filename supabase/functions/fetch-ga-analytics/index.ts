import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GAMetric {
  name: string;
  values: string[];
}

interface GADimension {
  name: string;
  values: string[];
}

interface GAResponse {
  dimensionHeaders: GADimension[];
  metricHeaders: GAMetric[];
  rows: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dateRange = '7daysAgo', metricType = 'overview' } = await req.json();
    
    const serviceAccountJson = Deno.env.get('GOOGLE_ANALYTICS_SERVICE_ACCOUNT');
    const propertyId = Deno.env.get('GA_PROPERTY_ID');

    if (!serviceAccountJson || !propertyId) {
      throw new Error('Missing Google Analytics credentials');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Get OAuth2 access token
    const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const jwtClaimSet = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };
    
    const jwtClaimSetEncoded = btoa(JSON.stringify(jwtClaimSet));
    const signatureInput = `${jwtHeader}.${jwtClaimSetEncoded}`;
    
    // Import private key for signing
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      pemToArrayBuffer(serviceAccount.private_key),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      new TextEncoder().encode(signatureInput)
    );
    
    const jwt = `${signatureInput}.${arrayBufferToBase64(signature)}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('Failed to obtain access token');
    }

    // Determine metrics and dimensions based on type
    let reportRequest: any = {
      dateRanges: [{ startDate: dateRange, endDate: 'today' }],
    };

    switch (metricType) {
      case 'overview':
        reportRequest.metrics = [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'engagementRate' },
        ];
        reportRequest.dimensions = [{ name: 'date' }];
        break;
      
      case 'realtime':
        reportRequest.metrics = [{ name: 'activeUsers' }];
        reportRequest.dimensions = [{ name: 'unifiedScreenName' }];
        break;
      
      case 'traffic':
        reportRequest.metrics = [
          { name: 'sessions' },
          { name: 'totalUsers' },
        ];
        reportRequest.dimensions = [
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ];
        break;
      
      case 'pages':
        reportRequest.metrics = [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ];
        reportRequest.dimensions = [{ name: 'pagePath' }];
        reportRequest.limit = 10;
        break;
      
      case 'devices':
        reportRequest.metrics = [
          { name: 'sessions' },
          { name: 'totalUsers' },
        ];
        reportRequest.dimensions = [{ name: 'deviceCategory' }];
        break;
      
      case 'geography':
        reportRequest.metrics = [
          { name: 'sessions' },
          { name: 'totalUsers' },
        ];
        reportRequest.dimensions = [
          { name: 'country' },
          { name: 'city' },
        ];
        reportRequest.limit = 10;
        break;
    }

    // Fetch GA4 data
    const gaResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportRequest),
      }
    );

    const gaData = await gaResponse.json();
    
    if (!gaResponse.ok) {
      console.error('GA API error:', gaData);
      throw new Error(gaData.error?.message || 'Failed to fetch GA data');
    }

    return new Response(JSON.stringify(gaData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper functions
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
