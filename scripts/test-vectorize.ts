import { config } from 'dotenv'
import { getVectorizeClient } from '../src/lib/ai/vectorize'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') })

async function testVectorizeAPI() {
  console.log('Testing Vectorize API Integration...\n')
  
  try {
    const vectorize = getVectorizeClient()
    
    // Test with a simple PDF file
    const testFilePath = path.join(__dirname, 'test-coi.pdf')
    
    // Create a simple test file if it doesn't exist
    if (!fs.existsSync(testFilePath)) {
      console.log('Creating test PDF file...')
      // For now, we'll just test the API connection
      const testContent = Buffer.from('Test COI Document')
      fs.writeFileSync(testFilePath, testContent)
    }
    
    // Convert to File object
    const fileBuffer = fs.readFileSync(testFilePath)
    const file = new File([fileBuffer], 'test-coi.pdf', { type: 'application/pdf' })
    
    console.log('Uploading file to Vectorize...')
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    const result = await vectorize.extractCOI(file)
    
    console.log('\nExtraction Result:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.success && result.data) {
      console.log('\n✅ File upload successful!')
      console.log('Extraction ID:', result.data)
      
      // Wait a moment then check status
      console.log('\nWaiting 2 seconds before checking status...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Checking extraction status...')
      const statusResult = await vectorize.getExtractionStatus(result.data as string)
      console.log('\nStatus Result:')
      console.log(JSON.stringify(statusResult, null, 2))
    } else {
      console.error('\n❌ Extraction failed:', result.error)
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:')
    console.error(error)
  }
}

// Run the test
testVectorizeAPI()