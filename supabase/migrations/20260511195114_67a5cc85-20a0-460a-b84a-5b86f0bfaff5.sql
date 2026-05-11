-- Function to create a notification on successful purchase
CREATE OR REPLACE FUNCTION public.handle_new_sale_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if the status changed to 'paid'
  IF (TG_OP = 'INSERT' AND NEW.status = 'paid') OR (TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid') THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.seller_user_id,
      'Nova venda realizada!',
      'Você acabou de vender o ebook "' || (SELECT title FROM public.ebooks WHERE id = NEW.ebook_id) || '" por R$ ' || (NEW.amount_paid_cents / 100.0)::text || '.',
      'sale'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on the purchases table
CREATE TRIGGER on_purchase_paid_notify_seller
AFTER INSERT OR UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_sale_notification();
