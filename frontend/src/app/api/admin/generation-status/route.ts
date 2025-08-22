import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 [API ROUTE] Generation status request received');
  console.log('🔍 [API ROUTE] Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const url = `${backendUrl}/admin/generation-status`;
    
    console.log('🔍 [API ROUTE] Backend URL:', url);
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    console.log('🔍 [API ROUTE] Auth header present:', !!authHeader);
    console.log('🔍 [API ROUTE] Auth header value:', authHeader ? `${authHeader.substring(0, 20)}...` : 'none');
    
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    };
    
    console.log('🔍 [API ROUTE] Fetch options:', fetchOptions);
    
    const response = await fetch(url, fetchOptions);
    
    console.log('🔍 [API ROUTE] Backend response status:', response.status);
    console.log('🔍 [API ROUTE] Backend response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('🔍 [API ROUTE] Backend response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ [API ROUTE] API proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
