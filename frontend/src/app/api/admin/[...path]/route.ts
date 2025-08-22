import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const path = pathSegments.join('/');
    const url = `${backendUrl}/admin/${path}`;
    
    console.log('🔍 [API PROXY] Request:', method, path);
    console.log('🔍 [API PROXY] Backend URL:', url);
    
    // Get headers from the request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('🔍 [API PROXY] Auth header present');
    } else {
      console.log('🔍 [API PROXY] No auth header');
    }
    
    // Get body for POST/PUT requests
    let body = undefined;
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await request.json();
        console.log('🔍 [API PROXY] Request body:', body);
      } catch {
        console.log('🔍 [API PROXY] No body or invalid JSON');
        // No body or invalid JSON
      }
    }
    
    console.log('🔍 [API PROXY] Making request to backend...');
    const response = await fetch(url, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    });

    console.log('🔍 [API PROXY] Backend response status:', response.status);
    
    const data = await response.json();
    console.log('🔍 [API PROXY] Backend response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('🔍 [API PROXY] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
