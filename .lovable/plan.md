I will investigate the cause of the Facebook search block and implement a more robust solution that includes a fallback to Google Search, which is a common and effective way to find groups without being blocked by Facebook's internal routing.

### Technical Analysis
- **Cause of the block**: Facebook has significantly tightened its search URL routing. Direct deep links to search results (like `/search/groups/?q=...`) often return "Not Found" (404) or redirect to login pages if the session state is not perfect or if the request is deemed "unusual".
- **Proposed Solution**: 
  - Update the Facebook search URL to the most standard internal path (`/groups/search/`).
  - Add a secondary option to search via Google (`site:facebook.com/groups ...`), which is often more reliable and bypasses Facebook's internal blocks.
  - Keep the user input field so they can adjust the query easily.

### Implementation Details
- **File**: `src/components/views/CreateEbookView.tsx`
- **Changes**:
  - Modify the primary search button to use a more stable Facebook URL.
  - Add a "Fallback" button or a "Search on Google" option to ensure the user always finds results.
  - Improve error handling and user feedback.

### User Interface
- Maintain the current " Passo 5" structure.
- Add a secondary search action for Google.
