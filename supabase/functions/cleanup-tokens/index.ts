import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log(`Function 'cleanup-tokens' up and running!`);

serve(async (_req) => {
  try {
    // Supabase клиентийг үүсгэхдээ нууц түлхүүр ашиглана
    const supabaseClient = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // Одоогийн цагаас өмнө хугацаа нь дууссан бичлэгүүдийг устгах
    const { data, error } = await supabaseClient
      .from('wifi_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString()); // 'lt' = less than

    if (error) {
      throw error;
    }

    // TODO: Устгасан SSID/нууц үгийг Starlink төхөөрөмжөөс мөн устгах логик нэмэх

    return new Response(JSON.stringify({ message: `Successfully deleted expired tokens.`, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
