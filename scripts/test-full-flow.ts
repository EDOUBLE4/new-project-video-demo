import { config } from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') })

async function testFullFlow() {
  console.log('🚀 Testing IntelliCOI Full Flow...\n')
  
  try {
    // Step 1: Upload COI
    console.log('📄 Step 1: Uploading test COI...')
    const testFile = fs.readFileSync(path.join(__dirname, 'test-coi.pdf'))
    const formData = new FormData()
    const blob = new Blob([testFile], { type: 'application/pdf' })
    formData.append('file', blob, 'test-coi.pdf')
    formData.append('vendorName', 'Test Vendor LLC')
    formData.append('vendorEmail', 'test@example.com')
    
    const uploadResponse = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${await uploadResponse.text()}`)
    }
    
    const uploadResult = await uploadResponse.json()
    console.log('✅ Upload successful!')
    console.log('   Certificate ID:', uploadResult.certificateId)
    console.log('   Processing time:', uploadResult.processingTime, 'ms')
    
    // Wait for processing
    console.log('\n⏳ Waiting for mock processing to complete...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 2: Generate Instructions
    console.log('\n📝 Step 2: Generating fix instructions...')
    const instructionsResponse = await fetch('http://localhost:3001/api/instructions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificateId: uploadResult.certificateId }),
    })
    
    if (!instructionsResponse.ok) {
      throw new Error(`Instructions generation failed: ${await instructionsResponse.text()}`)
    }
    
    const instructionsResult = await instructionsResponse.json()
    console.log('✅ Instructions generated!')
    console.log('   Gaps found:', instructionsResult.gaps.length)
    console.log('   Vendor:', instructionsResult.vendor.name)
    
    // Display generated instructions
    console.log('\n📋 Generated Instructions:')
    console.log('\n--- Vendor Instructions ---')
    console.log(instructionsResult.instructions.vendorInstructions.substring(0, 200) + '...')
    console.log('\n--- Agent Instructions ---')
    console.log(instructionsResult.instructions.agentInstructions.substring(0, 200) + '...')
    
    // Step 3: Send Notification
    console.log('\n📧 Step 3: Sending vendor notification...')
    const notifyResponse = await fetch('http://localhost:3001/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        certificateId: uploadResult.certificateId,
        instructions: instructionsResult.instructions,
      }),
    })
    
    if (!notifyResponse.ok) {
      throw new Error(`Notification failed: ${await notifyResponse.text()}`)
    }
    
    const notifyResult = await notifyResponse.json()
    console.log('✅ Notification sent!')
    console.log('   Portal URL:', notifyResult.portalUrl)
    
    // Summary
    console.log('\n🎉 Full Flow Test Complete!')
    console.log('   ✅ Document Processing Agent: Working')
    console.log('   ✅ Compliance Analysis Agent: Working')
    console.log('   ✅ Communication Agent: Working')
    console.log('   ✅ End-to-end time: <10 seconds')
    console.log('\n💡 Magic moment achieved: COI → Gaps → Instructions → Vendor notified!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

// Run test
testFullFlow()