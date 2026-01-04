import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { Job } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bbox } = body

    if (!bbox || !bbox.north || !bbox.south || !bbox.east || !bbox.west) {
      return NextResponse.json(
        { error: 'Invalid bbox format' },
        { status: 400 }
      )
    }

    // TODO: 認証が実装されたら、実際のユーザーIDを取得
    // 現在は仮のユーザーIDを使用
    const userId = '00000000-0000-0000-0000-000000000000'

    // 範囲チェック（最大1km x 1km）
    const latDiff = bbox.north - bbox.south
    const lngDiff = bbox.east - bbox.west
    const maxSize = 0.009 // 約1km

    if (latDiff > maxSize || lngDiff > maxSize) {
      return NextResponse.json(
        { error: 'Bounding box too large. Maximum 1km x 1km allowed.' },
        { status: 400 }
      )
    }

    // ジョブを作成
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        user_id: userId,
        bbox,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // TODO: バックグラウンドジョブをキューに追加
    // 現在は手動で処理する必要があります

    return NextResponse.json(data as Job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: 認証が実装されたら、ユーザーIDでフィルタ
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data as Job[])
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
