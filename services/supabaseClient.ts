import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsxywwvjmqtdrwxlfhqx.supabase.co';
const supabaseAnonKey = 'sb_publishable_V1UjTmMrRxgW6cKfVKvHHA_-caWdq4e';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
