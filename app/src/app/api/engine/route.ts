import { NextRequest, NextResponse } from 'next/server'
import { CoreEngine, EngineConfig } from '@app/core-engine'

// Create a singleton engine instance for the API
let engineInstance: CoreEngine | null = null

async function getEngine(): Promise<CoreEngine> {
  if (!engineInstance) {
    const config: EngineConfig = {
      name: 'API Engine',
      version: '1.0.0',
      debug: process.env.NODE_ENV === 'development',
      features: ['api', 'typescript', 'nextjs']
    }
    
    engineInstance = new CoreEngine(config)
    await engineInstance.initialize()
  }
  
  return engineInstance
}

export async function GET() {
  try {
    const engine = await getEngine()
    const state = engine.getState()
    
    return NextResponse.json({
      success: true,
      data: state
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const engine = await getEngine()
    const body = await request.json()
    
    if (body.action === 'setData' && body.key && body.value !== undefined) {
      engine.setData(body.key, body.value)
    } else if (body.action === 'updateConfig' && body.config) {
      engine.updateConfig(body.config)
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action or missing parameters' },
        { status: 400 }
      )
    }
    
    const state = engine.getState()
    
    return NextResponse.json({
      success: true,
      data: state
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
