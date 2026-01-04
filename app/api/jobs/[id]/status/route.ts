import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { JobStatus } from '@/types/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, error: errorMessage } = body

    if (!status || !['pending', 'running', 'succeeded', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updateData: { status: JobStatus; finished_at?: string; error?: string } = {
      status: status as JobStatus,
    }

    if (status === 'succeeded' || status === 'failed') {
      updateData.finished_at = new Date().toISOString()
    }

    if (status === 'failed' && errorMessage) {
      updateData.error = errorMessage
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating job status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
