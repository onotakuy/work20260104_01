export type JobStatus = 'pending' | 'running' | 'succeeded' | 'failed'

export interface Job {
  id: string
  user_id: string
  bbox: {
    north: number
    south: number
    east: number
    west: number
  }
  status: JobStatus
  created_at: string
  finished_at: string | null
  cost_estimate: number | null
  error: string | null
}

export interface Asset {
  id: string
  job_id: string
  type: 'model' | 'texture' | 'preview'
  r2_path: string
  size: number
  checksum: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
}

export interface BillingEvent {
  id: string
  user_id: string
  job_id: string | null
  amount: number
  currency: string
  plan: string
  created_at: string
}

