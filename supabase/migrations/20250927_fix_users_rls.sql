-- ✅ Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 🚮 Drop insecure anon insert policy
DROP POLICY IF EXISTS "Allow anon insert for testing" ON public.users;

-- 🔄 Drop and recreate SELECT policy with correct role
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 🔄 Drop and recreate UPDATE policy with correct role
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ✅ Keep INSERT policy (already correct)
-- "Allow authenticated users to insert themselves"
