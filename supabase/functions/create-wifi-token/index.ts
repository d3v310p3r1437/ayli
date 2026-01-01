import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Generate a random password
function generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
    }

    try {
        const { code_id, duration_hours } = await req.json();

        if (!code_id || !duration_hours) {
            throw new Error('Missing required parameters: code_id and duration_hours');
        }

        // Get Supabase credentials from environment variables
        const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY'); // <-- FIXED HERE

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase environment variables are not set.');
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const ssid = `Starlink-Guest-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const password = generatePassword(12);

        const expires_at = new Date();
        expires_at.setHours(expires_at.getHours() + parseInt(duration_hours, 10));

        const { data, error } = await supabase
            .from('wifi_tokens')
            .insert({
                code_id,
                ssid,
                password,
                expires_at: expires_at.toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }

        // TODO: Add logic to push credentials to Starlink device via SSH or API

        return new Response(
            JSON.stringify({ ssid, password }),
            {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                status: 200,
            },
        )
    } catch (error) {
        console.error('Function error:', error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                status: 400,
            },
        )
    }
})
