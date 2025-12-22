export function jwtDecode<T>(token:string): T | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split("")
                .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
                .join("")
        );

        const decoded = JSON.parse(jsonPayload);

        // Check if token has expired
        if (decoded.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                console.warn("Token has expired!");
                return null;
            }
        }

        return decoded as T;
    } catch (error) {
        console.error("Invalid JWT token", error);
        return null;
    }
}