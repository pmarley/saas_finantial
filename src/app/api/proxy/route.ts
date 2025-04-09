import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://truemetrics-n8n-n8n.b5glig.easypanel.host';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';
  const token = request.headers.get('authorization');
  
  // Extract all query parameters except 'path'
  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'path') {
      queryParams.append(key, value);
    }
  });
  
  // Construct the full URL with query parameters
  const queryString = queryParams.toString();
  const fullUrl = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
  
  console.log('Proxy: Forwarding request to:', fullUrl);

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';
  const token = request.headers.get('authorization');
  const body = await request.json();
  
  // Extract all query parameters except 'path'
  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'path') {
      queryParams.append(key, value);
    }
  });
  
  // Construct the full URL with query parameters
  const queryString = queryParams.toString();
  const fullUrl = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
  
  console.log('Proxy: Forwarding POST request to:', fullUrl);

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to send data to API' },
      { status: 500 }
    );
  }
} 