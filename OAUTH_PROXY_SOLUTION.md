# OAuth Proxy Solution for Mobile App

## Problem
- Expo's auth proxy (`https://auth.expo.io`) is **deprecated** and unreliable
- Custom URL schemes don't work for Google Web/iOS OAuth clients (Google's policy)
- Current implementation hangs or shows "Something went wrong" errors

## Solution: Backend OAuth Proxy

Since Expo's proxy is broken and custom schemes aren't allowed, we need to implement a **backend OAuth proxy** that:
1. Receives OAuth redirects from Google (HTTPS endpoint)
2. Exchanges authorization codes for tokens
3. Gets user info from Google
4. Redirects back to the mobile app with user info

## Implementation Required

### Backend Changes Needed

Add the following endpoints to `/app/api/v1/endpoints/auth.py`:

```python
@router.get("/oauth/google/initiate")
async def initiate_google_oauth(
    request: Request,
    app_scheme: str = Query(..., description="App URL scheme (e.g., 'skyai')"),
) -> Any:
    """
    Initiate Google OAuth flow - returns authorization URL with backend redirect URI.
    """
    from urllib.parse import urlencode
    import secrets

    # Generate state for CSRF protection
    state = secrets.token_urlsafe(32)

    # Store state in session/cache (Redis recommended)
    # For now, we'll pass it in the redirect URL

    # Backend callback URL (HTTPS)
    callback_url = f"{settings.API_BASE_URL}/api/v1/auth/oauth/google/callback"

    # Google OAuth parameters
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": callback_url,
        "response_type": "code",
        "scope": "openid profile email",
        "state": f"{state}:{app_scheme}",  # Encode app scheme in state
        "access_type": "offline",
        "prompt": "consent",
    }

    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    return {"auth_url": auth_url, "state": state}

@router.get("/oauth/google/callback")
async def google_oauth_callback(
    request: Request,
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Handle Google OAuth callback - exchange code for tokens and get user info.
    """
    import httpx

    # Parse state to get app scheme
    parts = state.split(":", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    _, app_scheme = parts

    # Exchange authorization code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": f"{settings.API_BASE_URL}/api/v1/auth/oauth/google/callback",
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to exchange code: {token_response.text}"
            )
        tokens = token_response.json()

    # Get user info from Google
    user_info_response = await client.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    if user_info_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch user info")
    google_user = user_info_response.json()

    # Create or get user in database
    user = crud_user.get_by_email(db, email=google_user["email"])
    if not user:
        user_create = UserCreate(
            email=google_user["email"],
            full_name=google_user.get("name", ""),
            password="",
            is_active=True
        )
        user = crud_user.create_oauth_user(
            db,
            obj_in=user_create,
            provider="google",
            provider_id=google_user["sub"],
            avatar_url=google_user.get("picture"),
        )

    # Generate JWT tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(user.id, expires_delta=access_token_expires)

    # Create refresh token
    ip_address = request.client.host if request.client else None
    device_info = json.dumps({
        "user_agent": request.headers.get("user-agent", ""),
        "origin": request.headers.get("origin", ""),
        "provider": "google"
    }) if request.headers else None

    refresh_token_db, refresh_token_plain = crud_refresh_token.create_token(
        db,
        user_id=user.id,
        device_info=device_info,
        ip_address=ip_address
    )

    # Redirect to app with tokens in URL parameters
    # Format: skyai://oauth/callback?access_token=...&refresh_token=...&user=...
    redirect_url = (
        f"{app_scheme}://oauth/callback"
        f"?access_token={access_token}"
        f"&refresh_token={refresh_token_plain}"
        f"&user_id={user.id}"
        f"&email={google_user['email']}"
        f"&name={google_user.get('name', '')}"
    )

    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=redirect_url)
```

### Mobile App Changes Needed

Update `/lib/auth/oauth.ts` to use backend proxy:

```typescript
export async function loginWithGoogle(): Promise<OAuthUserInfo> {
  try {
    // 1. Request OAuth URL from backend
    const { auth_url } = await apiClient.get('/auth/oauth/google/initiate', {
      params: { app_scheme: Constants.expoConfig?.scheme || 'skyai' }
    });

    // 2. Open OAuth URL in browser
    const result = await WebBrowser.openAuthSessionAsync(
      auth_url,
      `${Constants.expoConfig?.scheme || 'skyai'}://oauth/callback`
    );

    if (result.type !== 'success' || !result.url) {
      throw new Error('OAuth flow cancelled or failed');
    }

    // 3. Parse redirect URL with tokens
    const parsed = Linking.parse(result.url);
    const accessToken = parsed.queryParams?.access_token as string;
    const refreshToken = parsed.queryParams?.refresh_token as string;
    const email = parsed.queryParams?.email as string;
    const name = parsed.queryParams?.name as string;

    if (!accessToken || !refreshToken) {
      throw new Error('Tokens not received from OAuth callback');
    }

    // 4. Return user info (tokens already handled by backend)
    return {
      email,
      name: name || '',
      provider: 'google',
      providerId: parsed.queryParams?.user_id as string || '',
    };
  } catch (error: any) {
    throw error;
  }
}
```

## Google Cloud Console Configuration

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Select your **Web application** OAuth client
3. Add to **Authorized redirect URIs**:
   - `https://your-api-domain.com/api/v1/auth/oauth/google/callback`
   - (Or your ngrok URL for local dev: `https://your-ngrok-url.ngrok-free.app/api/v1/auth/oauth/google/callback`)

## Next Steps

1. Implement backend endpoints (above)
2. Update mobile app OAuth flow (above)
3. Configure Google Cloud Console with backend callback URL
4. Test the flow end-to-end

## Benefits

- ✅ Works with Google's OAuth policies (HTTPS redirect)
- ✅ No reliance on deprecated Expo proxy
- ✅ More control over OAuth flow
- ✅ Better error handling
- ✅ Can add additional security measures (CSRF tokens, etc.)

