/**
 * DEEP LINK HANDLER - HOW IT WORKS
 * 
 * THE PROBLEM:
 * When a user clicks the password reset link in their email, the app opens with tokens 
 * in the URL (after the # symbol). But we don't know WHEN the user will click it - 
 * could be immediately, could be 5 minutes later, could be while the app is already open.
 * We can't just wait for it synchronously because that would freeze the app.
 * 
 * THE SOLUTION: CALLBACKS (Like giving someone your phone number)
 * 
 * Real-life analogy:
 * - You order pizza and give them your phone number (callback function)
 * - You go home and do other stuff (app continues running)
 * - When pizza is ready, they CALL YOUR NUMBER (execute your callback)
 * - You answer and they tell you "pizza ready!" (callback receives the tokens)
 * 
 * CODE FLOW:
 * 
 * 1. Component calls: getDeepLink(handleTokens)
 *    - We're giving getDeepLink our "phone number" (the handleTokens function)
 *    - NOT calling handleTokens ourselves, just passing the function reference
 * 
 * 2. getDeepLink sets up TWO listeners:
 *    a) Linking.getInitialURL() - checks if app opened from a deep link (app was closed)
 *    b) Linking.addEventListener() - listens for deep links while app is running
 * 
 * 3. When a deep link arrives (user clicks email link):
 *    - parseUrl() extracts tokens from the URL hash fragment (#access_token=xxx&refresh_token=yyy)
 *    - getDeepLink calls: callback(parsed) 
 *      ↑ This is like calling: handleTokens(parsed)
 *      ↑ getDeepLink is "calling your phone number" and passing the tokens
 * 
 * 4. handleTokens receives the tokens and runs:
 *    - Sets Supabase session with the tokens
 *    - Updates UI to enable password reset form
 * 
 * 5. Cleanup:
 *    - getDeepLink returns a cleanup function: () => subscription.remove()
 *    - Component stores this and calls it on unmount to stop listening
 *    - Prevents memory leaks from listeners that never get removed
 * 
 * KEY POINTS:
 * - handleTokens is defined WITH a parameter (tokens) but passed WITHOUT calling it
 * - getDeepLink calls our callback FOR US when tokens arrive
 * - The .then() captures the cleanup function to remove event listeners later
 * - This pattern lets us handle async events without blocking the app
 */


// import { Linking } from "react-native";

// export const parseUrl = (url: string) => {
//     const hashIndex = url.indexOf('#');
//     if (hashIndex === -1) return null;

//     const hash = url.substring(hashIndex + 1);
//     const params = new URLSearchParams(hash);
//     console.log(params.get('access_token'), 'HEYYYYYYYYYYYY', url)
//     return {
//         access_token: params.get('access_token'),
//         refresh_token: params.get('refresh_token'),
//         token_type: params.get('token_type'),
//         type: params.get('type'),
//         error: params.get('error'),
//         error_description: params.get('error_description'),
//     };
// };

// export const getDeepLink = async (callback: (tokens: ReturnType<typeof parseUrl>) => void) => {
//     console.log('GetDeepLink function')
//     try {
//         // Get the initial URL when app opens from a deep link while already closed and not running
//         const initialUrl = await Linking.getInitialURL();
//         console.log('Initial URL:', initialUrl);

//         if (initialUrl) {
//             const parsed = parseUrl(initialUrl);
//             console.log('Parsed initial URL:', parsed);
//             if (parsed) {
//                 callback(parsed);
//             }
//         }

//         // Listen for deep links while the app is running
//         const subscription = Linking.addEventListener('url', ({ url }) => {
//             console.log('Deep link received:', url);
//             const parsed = parseUrl(url);
//             console.log('Parsed URL:', parsed);
//             if (parsed) {
//                 callback(parsed);
//             }
//         });

//         // Return cleanup function
//         return () => {
//             subscription.remove();
//         };
//     } catch (error) {
//         console.error('Error handling deep link:', error);
//         return () => { }; // Return empty cleanup function on error
//     }
// };



import { useEffect } from "react";
import { Linking } from "react-native";

/**
 * Custom hook to handle deep links for Supabase auth flows.
 */
export const useDeepLink = (callback: (tokens: any) => void) => {
    useEffect(() => {
        let isMounted = true;

        const handleUrl = ({ url }: { url: string }) => {
            console.log("📨 Deep link received:", url);
            const parsed = parseUrl(url);
            console.log("🔍 Parsed deep link result:", parsed);
            if (parsed && isMounted) {
                callback(parsed);
            }
        };

        const handleInitialUrl = async () => {
            try {
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl) {
                    console.log("🚀 Initial URL detected:", initialUrl);
                    handleUrl({ url: initialUrl });
                }
            } catch (err) {
                console.error("Error fetching initial URL:", err);
            }
        };

        handleInitialUrl();

        const subscription = Linking.addEventListener("url", handleUrl);

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, [callback]);
};

/**
 * Parses a Supabase deep link and extracts token parameters.
 */
export const parseUrl = (url: string) => {
    if (!url || !url.includes("auth/")) return null; // ignore Expo dev URLs

    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) return null;

    const hash = url.substring(hashIndex + 1);
    const params = new URLSearchParams(hash);

    const result = {
        access_token: params.get("access_token"),
        refresh_token: params.get("refresh_token"),
        token_type: params.get("token_type"),
        type: params.get("type"),
        error: params.get("error"),
        error_description: params.get("error_description"),
    };

    // Skip invalid or empty links
    if (!result.access_token && !result.refresh_token) return null;

    return result;
};
