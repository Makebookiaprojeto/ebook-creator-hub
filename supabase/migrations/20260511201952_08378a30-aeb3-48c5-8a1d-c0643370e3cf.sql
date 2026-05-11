-- Enable essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Use DO blocks to handle existing objects gracefully
DO $$ 
BEGIN
    -- PROFILES TABLE (If it exists but is different, this won't change structure but ensures RLS)
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
            display_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- EBOOKS TABLE
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ebooks') THEN
        CREATE TABLE public.ebooks (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            description TEXT,
            category TEXT,
            niche TEXT,
            audience TEXT,
            cover_url TEXT,
            pdf_url TEXT,
            price_cents INTEGER DEFAULT 2990,
            status TEXT DEFAULT 'draft',
            is_public BOOLEAN DEFAULT false,
            slug TEXT UNIQUE,
            content_json JSONB,
            is_template BOOLEAN DEFAULT false,
            generation_status TEXT DEFAULT 'done',
            generation_progress JSONB,
            generation_error TEXT,
            payment_platform TEXT DEFAULT 'cakto',
            external_product_id TEXT,
            cakto_product_id TEXT,
            cakto_checkout_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own ebooks' AND tablename = 'ebooks') THEN
        CREATE POLICY "Users can manage their own ebooks" ON public.ebooks USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public ebooks are viewable by everyone' AND tablename = 'ebooks') THEN
        CREATE POLICY "Public ebooks are viewable by everyone" ON public.ebooks FOR SELECT USING (is_public = true OR auth.uid() = user_id);
    END IF;
END $$;

-- CHAPTERS TABLE
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chapters') THEN
        CREATE TABLE public.chapters (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            image_url TEXT,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Chapters are viewable by everyone' AND tablename = 'chapters') THEN
        CREATE POLICY "Chapters are viewable by everyone" ON public.chapters FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.ebooks 
                WHERE ebooks.id = chapters.ebook_id 
                AND (ebooks.is_public = true OR ebooks.user_id = auth.uid())
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage chapters of their own ebooks' AND tablename = 'chapters') THEN
        CREATE POLICY "Users can manage chapters of their own ebooks" ON public.chapters FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.ebooks 
                WHERE ebooks.id = chapters.ebook_id 
                AND ebooks.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- PURCHASES TABLE
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'purchases') THEN
        CREATE TABLE public.purchases (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            ebook_id UUID REFERENCES public.ebooks(id) ON DELETE SET NULL,
            buyer_email TEXT NOT NULL,
            amount_paid_cents INTEGER NOT NULL,
            status TEXT DEFAULT 'paid',
            external_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- USER ROLES (Needed for admin policies)
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        CREATE TABLE public.user_roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            UNIQUE(user_id, role)
        );
    END IF;
END $$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Everyone can see roles' AND tablename = 'user_roles') THEN
        CREATE POLICY "Everyone can see roles" ON public.user_roles FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own purchases' AND tablename = 'purchases') THEN
        CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id OR buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all purchases' AND tablename = 'purchases') THEN
        CREATE POLICY "Admins can view all purchases" ON public.purchases FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
            )
        );
    END IF;
END $$;

-- SUBSCRIPTIONS TABLE
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
        CREATE TABLE public.subscriptions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            buyer_email TEXT,
            plan_type TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            expires_at TIMESTAMP WITH TIME ZONE,
            external_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own subscriptions' AND tablename = 'subscriptions') THEN
        CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR buyer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
    END IF;
END $$;

-- NOTIFICATIONS TABLE
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        CREATE TABLE public.notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            message TEXT,
            type TEXT DEFAULT 'info',
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own notifications' AND tablename = 'notifications') THEN
        CREATE POLICY "Users can manage their own notifications" ON public.notifications USING (auth.uid() = user_id);
    END IF;
END $$;

-- EBOOK VIEWS (ANALYTICS)
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ebook_views') THEN
        CREATE TABLE public.ebook_views (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            ebook_id UUID REFERENCES public.ebooks(id) ON DELETE CASCADE NOT NULL,
            viewer_ip TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

ALTER TABLE public.ebook_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow inserting views' AND tablename = 'ebook_views') THEN
        CREATE POLICY "Allow inserting views" ON public.ebook_views FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view analytics for their own ebooks' AND tablename = 'ebook_views') THEN
        CREATE POLICY "Users can view analytics for their own ebooks" ON public.ebook_views FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.ebooks 
                WHERE ebooks.id = ebook_views.ebook_id 
                AND ebooks.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create triggers safely
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS update_ebooks_updated_at ON public.ebooks;
CREATE TRIGGER update_ebooks_updated_at BEFORE UPDATE ON public.ebooks FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RPC for Role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for checking email exists
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = email_to_check);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for public ebooks
DROP VIEW IF EXISTS public.public_ebooks;
CREATE OR REPLACE VIEW public.public_ebooks AS
SELECT * FROM public.ebooks WHERE is_public = true OR status = 'published';
