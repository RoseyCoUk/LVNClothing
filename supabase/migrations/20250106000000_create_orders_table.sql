-- Create orders table for storing order information
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  stripe_session_id text not null,
  customer_email text not null,
  items jsonb not null, -- e.g. [{ name: "Reform Hoodie", price: "£35", quantity: 1 }]
  created_at timestamptz default now()
);

-- Create index on stripe_session_id for faster lookups
create index idx_orders_stripe_session_id on public.orders(stripe_session_id);

-- Create index on customer_email for customer order history
create index idx_orders_customer_email on public.orders(customer_email);

-- Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- Create policy to allow authenticated users to view their own orders
create policy "Users can view their own orders" on public.orders
  for select using (auth.email() = customer_email);

-- Create policy to allow service role to insert orders (for webhook)
create policy "Service role can insert orders" on public.orders
  for insert with check (true);

-- Create policy to allow service role to update orders
create policy "Service role can update orders" on public.orders
  for update using (true); 