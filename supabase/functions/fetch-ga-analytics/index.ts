import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dateRange = '7daysAgo', metricType = 'overview' } = await req.json();
    
    const serviceAccountJson = Deno.env.get('GOOGLE_ANALYTICS_SERVICE_ACCOUNT');
    const propertyId = Deno.env.get('GA_PROPERTY_ID');

    console.log('Service Account exists:', !!serviceAccountJson);
    console.log('Property ID:', propertyId);

    if (!serviceAccountJson || !propertyId) {
      throw new Error('Missing Google Analytics credentials');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Create JWT using djwt library
    const now = Math.floor(Date.now() / 1000);
    
    // Import private key
    const privateKeyPem = serviceAccount.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    
    const binaryKey = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Create JWT
    const jwt = await create(
      { alg: 'RS256', typ: 'JWT' },
      {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: getNumericDate(3600),
        iat: getNumericDate(0),
      },
      cryptoKey
    );

    console.log('JWT created successfully');

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    console.log('Token response status:', tokenResponse.status);
    const tokenText = await tokenResponse.text();
    console.log('Token response body:', tokenText.substring(0, 200));

    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {
      console.error('Failed to parse token response:', e);
      throw new Error(`Invalid token response: ${tokenText.substring(0, 100)}`);
    }

    if (!tokenData.access_token) {
      console.error('Token error:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to obtain access token');
    }

    console.log('Access token obtained');

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

    console.log('Fetching GA data for property:', propertyId);

    // Fetch GA4 data
    const normalizedPropertyId = propertyId.startsWith('properties/')
      ? propertyId
      : `properties/${propertyId}`;

    console.log('Normalized property id:', normalizedPropertyId);

    // Choose correct Analytics Data API endpoint
    const endpointPath = metricType === 'realtime'
      ? `${normalizedPropertyId}:runRealtimeReport`
      : `${normalizedPropertyId}:runReport`;

    const gaResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${endpointPath}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(reportRequest),
      }
    );

    const contentType = gaResponse.headers.get('content-type') || '';
    const gaText = await gaResponse.text();
    console.log('GA response status:', gaResponse.status, 'content-type:', contentType);

    let gaData: any;
    try {
      gaData = JSON.parse(gaText);
    } catch (_e) {
      console.error('Non-JSON GA response snippet:', gaText.slice(0, 300));
      throw new Error(`Google Analytics returned non-JSON (status ${gaResponse.status}). Check property access and ID format.`);
    }
    
    if (!gaResponse.ok) {
      console.error('GA API error JSON:', gaData);

      const details = Array.isArray(gaData?.error?.details)
        ? gaData.error.details.find((d: any) => d?.reason === 'SERVICE_DISABLED' || d?.metadata?.service === 'analyticsdata.googleapis.com')
        : undefined;

      if (gaData?.error?.status === 'PERMISSION_DENIED' && details) {
        const activationUrl = details?.metadata?.activationUrl || 'https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview';
        return new Response(
          JSON.stringify({
            error: 'Google Analytics Data API is disabled for the Google Cloud project used by your service account.',
            gcp_project: details?.metadata?.containerInfo,
            ga_property: normalizedPropertyId,
            next_steps: [
              `Enable the API here: ${activationUrl}`,
              `Add the service account (${serviceAccount.client_email}) to GA4 property ${normalizedPropertyId.replace('properties/', '')} with at least Viewer access.`,
            ],
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(gaData.error?.message || 'Failed to fetch GA data');
    }

    console.log('GA data fetched successfully');

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
