1. Clean up redundant database tables by merging 'orders' and 'ebook_sales' into the 'purchases' table.
2. Remove deprecated tables: 'orders', 'ebook_sales', 'public_ebook_checkout', and 'ebook_payment_config'.
3. Refactor the 'unified-webhook' Edge Function to be more robust, idempotent, and support per-ebook webhook secrets.
4. Update the frontend (LibraryView and Hooks) to standardize on the 'purchases' table for tracking sales.
5. Ensure all payment configuration (Checkout URL, Product ID) is stored directly in the 'ebooks' table.
6. Verify and fix RLS policies for the 'purchases' table to ensure owners can see their sales and buyers can see their purchases.

Technical Details:
- Migration script will handle data transfer from 'orders' to 'purchases'.
- 'purchases' table will be the single source of truth for all external payment platforms (Cakto, Hotmart, Kiwify).
- Webhook will check 'ebook_webhook_secrets' table for custom secrets before falling back to environment variables.
- All frontend calls to old tables will be replaced with 'purchases'.
