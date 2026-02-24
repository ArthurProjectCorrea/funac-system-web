/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, name } = body;
    if (!user_id)
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 },
      );

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .insert({ user_id, name })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
