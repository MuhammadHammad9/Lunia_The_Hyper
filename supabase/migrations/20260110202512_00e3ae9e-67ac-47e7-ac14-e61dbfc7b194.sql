-- Create a function to notify on order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Only send notifications for specific status changes
  IF NEW.status NOT IN ('processing', 'shipped', 'delivered') THEN
    RETURN NEW;
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Get user name from profiles
  SELECT full_name INTO user_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Call the edge function via pg_net (async HTTP request)
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_functions_url') || '/send-order-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'order_id', NEW.id,
      'new_status', NEW.status,
      'user_email', user_email,
      'order_number', NEW.order_number,
      'user_name', user_name
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in notify_order_status_change: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();